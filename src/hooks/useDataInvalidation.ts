import rdfFactory, { BlankNode, NamedNode, TermType } from "@ontologies/core";
import { normalizeType, rdflib } from "link-lib";
import * as React from "react";

import { DataInvalidationProps, SubjectType } from "../types";
import { useLRS } from "./useLRS";

/**
 * The subjects this component subscribes to.
 * Includes the subject by default.
 */
export function normalizeDataSubjects(props: DataInvalidationProps): SubjectType[] {
    if (!(props.subject || props.dataSubjects)) {
        return [];
    }

    let result;
    if (props.dataSubjects) {
        result = Array.isArray(props.dataSubjects)
            ? [props.subject, ...props.dataSubjects]
            : [props.subject, props.dataSubjects];
    } else {
        result = [props.subject];
    }

    if (props.subject && props.subject.termType === TermType.NamedNode) {
        const doc = rdfFactory.namedNode(rdflib.URI.docpart(props.subject.value));
        if (!rdfFactory.equals(doc, props.subject)) {
            result.push(doc);
        }
    }

    return result;
}

/**
 * Re-renders when {props.subject} or a resource mentioned in {props.dataSubjects} changes in the store.
 *
 * Be sure to keep undefined values in subject or dataSubjects to ensure useEffect DependencyList consistency.
 */
export function useDataInvalidation(props: DataInvalidationProps) {
    const lrs = useLRS();
    const [lastUpdate, setInvalidate] = React.useState<number>(
        (lrs as any).store.changeTimestamps[rdfFactory.id(props.subject)],
    );

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    React.useEffect(() => {
        const subscriptionSubjects = normalizeDataSubjects(props);

        return lrs.subscribe({
            callback: handleStatusChange,
            lastUpdateAt: undefined,
            markedForDelete: false,
            onlySubjects: true,
            subjectFilter: subscriptionSubjects.filter(Boolean),
        });
    }, [
      rdfFactory.id(props.subject),
      normalizeType(props.dataSubjects)
        .filter<NamedNode | BlankNode>(Boolean as any)
        .map<number>((n: NamedNode | BlankNode) => rdfFactory.id(n))
        .reduce((a: number, b: number) => a + b, 0),
    ]);

    return lastUpdate;
}
