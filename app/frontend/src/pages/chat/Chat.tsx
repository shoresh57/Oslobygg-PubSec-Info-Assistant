// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { useRef, useState, useEffect } from "react";
import { Checkbox, Panel, DefaultButton, TextField, SpinButton, Separator} from "@fluentui/react";
import { SparkleFilled, ClockFilled, TargetArrowFilled, OptionsFilled, SearchInfoFilled, PersonStarFilled, TextBulletListSquareSparkleFilled } from "@fluentui/react-icons";
import { ITag } from '@fluentui/react/lib/Pickers';
import oslokomune from "../../assets/oslokomune.svg";
import styles from "./Chat.module.css";
import rlbgstyles from "../../components/ResponseLengthButtonGroup/ResponseLengthButtonGroup.module.css";
import rtbgstyles from "../../components/ResponseTempButtonGroup/ResponseTempButtonGroup.module.css";

import { chatApi, Approaches, AskResponse, ChatRequest, ChatTurn } from "../../api";
import { Answer, AnswerError, AnswerLoading } from "../../components/Answer";
import { QuestionInput } from "../../components/QuestionInput";
import { ExampleList } from "../../components/Example";
import { UserChatMessage } from "../../components/UserChatMessage";
import { AnalysisPanel, AnalysisPanelTabs } from "../../components/AnalysisPanel";
import { SettingsButton } from "../../components/SettingsButton";
import { InfoButton } from "../../components/InfoButton";
import { ClearChatButton } from "../../components/ClearChatButton";
import { ResponseLengthButtonGroup } from "../../components/ResponseLengthButtonGroup";
import { ResponseTempButtonGroup } from "../../components/ResponseTempButtonGroup";
import { InfoContent } from "../../components/InfoContent/InfoContent";
import { FolderPicker } from "../../components/FolderPicker";
import { TagPickerInline } from "../../components/TagPicker";

const Chat = () => {
    const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
    const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
    const [promptTemplate, setPromptTemplate] = useState<string>("");
    const [retrieveCount, setRetrieveCount] = useState<number>(5);
    const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
    const [useSemanticCaptions, setUseSemanticCaptions] = useState<boolean>(false);
    const [excludeCategory, setExcludeCategory] = useState<string>("");
    const [useSuggestFollowupQuestions, setUseSuggestFollowupQuestions] = useState<boolean>(false);
    const [userPersona, setUserPersona] = useState<string>("analyst");
    const [systemPersona, setSystemPersona] = useState<string>("an Assistant");
    const [aiPersona, setAiPersona] = useState<string>("");
    // Setting responseLength to 2048 by default, this will effect the default display of the ResponseLengthButtonGroup below.
    // It must match a valid value of one of the buttons in the ResponseLengthButtonGroup.tsx file. 
    // If you update the default value here, you must also update the default value in the onResponseLengthChange method.
    const [responseLength, setResponseLength] = useState<number>(2048);
    // Setting responseTemp to 0.6 by default, this will effect the default display of the ResponseTempButtonGroup below.
    // It must match a valid value of one of the buttons in the ResponseTempButtonGroup.tsx file.
    // If you update the default value here, you must also update the default value in the onResponseTempChange method.
    const [responseTemp, setResponseTemp] = useState<number>(0.6);

    const lastQuestionRef = useRef<string>("");
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>();

    const [activeCitation, setActiveCitation] = useState<string>();
    const [activeCitationSourceFile, setActiveCitationSourceFile] = useState<string>();
    const [activeCitationSourceFilePageNumber, setActiveCitationSourceFilePageNumber] = useState<string>();
    const [activeAnalysisPanelTab, setActiveAnalysisPanelTab] = useState<AnalysisPanelTabs | undefined>(undefined);
    const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<ITag[]>([]);

    const [selectedAnswer, setSelectedAnswer] = useState<number>(0);
    const [answers, setAnswers] = useState<[user: string, response: AskResponse][]>([]);

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;

        error && setError(undefined);
        setIsLoading(true);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);

        try {
            const history: ChatTurn[] = answers.map(a => ({ user: a[0], bot: a[1].answer }));
            const request: ChatRequest = {
                history: [...history, { user: question, bot: undefined }],
                approach: Approaches.ReadRetrieveRead,
                overrides: {
                    promptTemplate: promptTemplate.length === 0 ? undefined : promptTemplate,
                    excludeCategory: excludeCategory.length === 0 ? undefined : excludeCategory,
                    top: retrieveCount,
                    semanticRanker: useSemanticRanker,
                    semanticCaptions: useSemanticCaptions,
                    suggestFollowupQuestions: useSuggestFollowupQuestions,
                    userPersona: userPersona,
                    systemPersona: systemPersona,
                    aiPersona: aiPersona,
                    responseLength: responseLength,
                    responseTemp: responseTemp,
                    selectedFolders: selectedFolders.includes("selectAll") ? "All" : selectedFolders.length == 0 ? "All" : selectedFolders.join(","),
                    selectedTags: selectedTags.map(tag => tag.name).join(",")
                }
            };
            const result = await chatApi(request);
            setAnswers([...answers, [question, result]]);
        } catch (e) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        lastQuestionRef.current = "";
        error && setError(undefined);
        setActiveCitation(undefined);
        setActiveAnalysisPanelTab(undefined);
        setAnswers([]);
    };

    const onResponseLengthChange = (_ev: any) => {
        for (let node of _ev.target.parentNode.childNodes) {
            if (node.value == _ev.target.value) {
                switch (node.value) {
                    case "1024":
                        node.className = `${rlbgstyles.buttonleftactive}`;
                        break;
                    case "2048":
                        node.className = `${rlbgstyles.buttonmiddleactive}`;
                        break;
                    case "3072":
                        node.className = `${rlbgstyles.buttonrightactive}`;
                        break;
                    default:
                        //do nothing
                        break;
                }                
            }
            else {
                switch (node.value) {
                    case "1024":
                        node.className = `${rlbgstyles.buttonleft}`;
                        break;
                    case "2048":
                        node.className = `${rlbgstyles.buttonmiddle}`;
                        break;
                    case "3072":
                        node.className = `${rlbgstyles.buttonright}`;
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
        }
        // the or value here needs to match the default value assigned to responseLength above.
        setResponseLength(_ev.target.value as number || 2048)
    };

    const onResponseTempChange = (_ev: any) => {
        for (let node of _ev.target.parentNode.childNodes) {
            if (node.value == _ev.target.value) {
                switch (node.value) {
                    case "1.0":
                        node.className = `${rtbgstyles.buttonleftactive}`;
                        break;
                    case "0.6":
                        node.className = `${rtbgstyles.buttonmiddleactive}`;
                        break;
                    case "0":
                        node.className = `${rtbgstyles.buttonrightactive}`;
                        break;
                    default:
                        //do nothing
                        break;
                }                
            }
            else {
                switch (node.value) {
                    case "1.0":
                        node.className = `${rtbgstyles.buttonleft}`;
                        break;
                    case "0.6":
                        node.className = `${rtbgstyles.buttonmiddle}`;
                        break;
                    case "0":
                        node.className = `${rtbgstyles.buttonright}`;
                        break;
                    default:
                        //do nothing
                        break;
                }
            }
        }
        // the or value here needs to match the default value assigned to responseLength above.
        setResponseTemp(_ev.target.value as number || 0.6)
    };

    useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isLoading]);

    const onRetrieveCountChange = (_ev?: React.SyntheticEvent<HTMLElement, Event>, newValue?: string) => {
        setRetrieveCount(parseInt(newValue || "5"));
    };

    const onUserPersonaChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setUserPersona(newValue || "");
    }

    const onSystemPersonaChange = (_ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setSystemPersona(newValue || "");
    }

    const onUseSuggestFollowupQuestionsChange = (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
        setUseSuggestFollowupQuestions(!!checked);
    };

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
    };

    const onShowCitation = (citation: string, citationSourceFile: string, citationSourceFilePageNumber: string, index: number) => {
        if (activeCitation === citation && activeAnalysisPanelTab === AnalysisPanelTabs.CitationTab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveCitation(citation);
            setActiveCitationSourceFile(citationSourceFile);
            setActiveCitationSourceFilePageNumber(citationSourceFilePageNumber);
            setActiveAnalysisPanelTab(AnalysisPanelTabs.CitationTab);
        }

        setSelectedAnswer(index);
    };

    const onToggleTab = (tab: AnalysisPanelTabs, index: number) => {
        if (activeAnalysisPanelTab === tab && selectedAnswer === index) {
            setActiveAnalysisPanelTab(undefined);
        } else {
            setActiveAnalysisPanelTab(tab);
        }

        setSelectedAnswer(index);
    };

    const onSelectedKeyChanged = (selectedFolders: string[]) => {
        setSelectedFolders(selectedFolders)
    };

    const onSelectedTagsChange = (selectedTags: ITag[]) => {
        setSelectedTags(selectedTags)
    }

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
                <SettingsButton className={styles.commandButton} onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)} />
                <InfoButton className={styles.commandButton} onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)} />
            </div>
            <div className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <div className={styles.chatEmptyState}>
                            <img src={oslokomune} alt="Azure OpenAI" style={{ width: '170px', height: '170px' }} />
                    
                            <span className={styles.chatEmptyObjectives}></span>
                            <h3 className={styles.chatEmptyStateTitle}>Turn Your Data into Powerful Insights</h3>
                            <span className={styles.chatEmptyObjectives}>
                            </span>
                            <span className={styles.chatEmptyObjectivesList}>
                                <span className={styles.chatEmptyObjectivesListItem}>
                                    
                                </span>
                                <span className={styles.chatEmptyObjectivesListItem}>
                                    
                                </span>
                                <span className={styles.chatEmptyObjectivesListItem}>
                                    
                                </span>
                                <span className={styles.chatEmptyObjectivesListItem}>
                                    
                                </span>
                                <span className={styles.chatEmptyObjectivesListItem}>
                                    
                                </span>
                                <span className={styles.chatEmptyObjectivesListItem}> 
                                    
                                </span>
                            </span>
                            <span className={styles.chatEmptyObjectives}>
                            </span>
                            <h2 className={styles.chatEmptyStateSubtitle}>Ask or test an example</h2>
                            <ExampleList onExampleClicked={onExampleClicked} />
                        </div>
                    ) : (
                        <div className={styles.chatMessageStream}>
                            {answers.map((answer, index) => (
                                <div key={index}>
                                    <UserChatMessage message={answer[0]} />
                                    <div className={styles.chatMessageGpt}>
                                        <Answer
                                            key={index}
                                            answer={answer[1]}
                                            isSelected={selectedAnswer === index && activeAnalysisPanelTab !== undefined}
                                            onCitationClicked={(c, s, p) => onShowCitation(c, s, p, index)}
                                            onThoughtProcessClicked={() => onToggleTab(AnalysisPanelTabs.ThoughtProcessTab, index)}
                                            onSupportingContentClicked={() => onToggleTab(AnalysisPanelTabs.SupportingContentTab, index)}
                                            onFollowupQuestionClicked={q => makeApiRequest(q)}
                                            showFollowupQuestions={useSuggestFollowupQuestions && answers.length - 1 === index}
                                            onAdjustClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
                                            onRegenerateClick={() => makeApiRequest(answers[index][0])}
                                        />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerLoading />
                                    </div>
                                </>
                            )}
                            {error ? (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerError error={error.toString()} onRetry={() => makeApiRequest(lastQuestionRef.current)} />
                                    </div>
                                </>
                            ) : null}
                            <div ref={chatMessageStreamEnd} />
                        </div>
                    )}

                    <div className={styles.chatInput}>
                        <QuestionInput
                            clearOnSend
                            placeholder="Type a new question"
                            disabled={isLoading}
                            onSend={question => makeApiRequest(question)}
                            onAdjustClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
                            onInfoClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                            showClearChat={true}
                            onClearClick={clearChat}
                            onRegenerateClick={() => makeApiRequest(lastQuestionRef.current)}
                        />
                    </div>
                </div>

                {answers.length > 0 && activeAnalysisPanelTab && (
                    <AnalysisPanel
                        className={styles.chatAnalysisPanel}
                        activeCitation={activeCitation}
                        sourceFile={activeCitationSourceFile}
                        pageNumber={activeCitationSourceFilePageNumber}
                        onActiveTabChanged={x => onToggleTab(x, selectedAnswer)}
                        citationHeight="760px"
                        answer={answers[selectedAnswer][1]}
                        activeTab={activeAnalysisPanelTab}
                    />
                )}

                <Panel
                    headerText="Configure answer generation"
                    isOpen={isConfigPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsConfigPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}
                >
                            <SpinButton
                                className={styles.chatSettingsSeparator}
                                label="Retrieve this many documents from search:"
                                min={1}
                                max={50}
                                defaultValue={retrieveCount.toString()}
                                onChange={onRetrieveCountChange}
                            />
                            <Checkbox
                                className={styles.chatSettingsSeparator}
                                checked={useSuggestFollowupQuestions}
                                label="Suggest follow-up questions"
                                onChange={onUseSuggestFollowupQuestionsChange}
                            />
                            <TextField className={styles.chatSettingsSeparator} defaultValue={userPersona} label="User Persona" onChange={onUserPersonaChange} />
                            <TextField className={styles.chatSettingsSeparator} defaultValue={systemPersona} label="System Persona" onChange={onSystemPersonaChange} />
                            <ResponseLengthButtonGroup className={styles.chatSettingsSeparator} onClick={onResponseLengthChange} defaultValue={responseLength}/>
                            <ResponseTempButtonGroup className={styles.chatSettingsSeparator} onClick={onResponseTempChange} defaultValue={responseTemp}/>
                            <Separator className={styles.chatSettingsSeparator}>Filter Search Results by</Separator>
                            <FolderPicker allowFolderCreation={false} onSelectedKeyChange={onSelectedKeyChanged} preSelectedKeys={selectedFolders}/>
                            <TagPickerInline allowNewTags={false} onSelectedTagsChange={onSelectedTagsChange} preSelectedTags={selectedTags}/>
                </Panel>

                <Panel
                    headerText="Information"
                    isOpen={isInfoPanelOpen}
                    isBlocking={false}
                    onDismiss={() => setIsInfoPanelOpen(false)}
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={() => <DefaultButton onClick={() => setIsInfoPanelOpen(false)}>Close</DefaultButton>}
                    isFooterAtBottom={true}                >
                        <div className={styles.resultspanel}>
                            <InfoContent/>
                        </div>
                </Panel>
            </div>
        </div>
    );
};

export default Chat;
