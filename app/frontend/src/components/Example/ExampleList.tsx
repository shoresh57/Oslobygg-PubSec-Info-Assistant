// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    { text: "Når ble dokumentet 001-G-G-00-200-02 opprettet og når ble det revidert?", value: "Når ble dokumentet 001-G-G-00-200-02 opprettet og når ble det revidert?" },
    { text: "Kan du gi mer kontekst eller informasjon om dokument-ID 117680?", value: "Kan du gi mer kontekst eller informasjon om dokument-ID 117680?" },
    { text: "Hva er det første du skal gjøre når du oppdager en brann ifølge branninstruksen fra skansenconsult?", value: "Hva er det første du skal gjøre når du oppdager en brann ifølge branninstruksen fra skansenconsult?" }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
