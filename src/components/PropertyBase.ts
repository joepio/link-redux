import { NamedNode, Quad, SomeTerm } from "@ontologies/core";
import { SomeNode } from "link-lib";
import * as ReactPropTypes from "prop-types";
import { ReactElement } from "react";
import * as React from "react";

import { LRSCtx } from "../contexts/LRSCtx";
import { normalizeDataSubjects } from "../hooks/useDataInvalidation";
import { labelType, linkedPropType, subjectType } from "../propTypes";
import { LabelType, LinkContext } from "../types";

export interface PropTypes extends LinkContext {
    label: LabelType;
    linkedProp?: SomeTerm;
}

/**
 * @deprecated
 */
export class PropertyBase<T extends PropTypes> extends React.Component<T> {
    public static contextType = LRSCtx;

    public static propTypes = {
        label: labelType,
        linkedProp: linkedPropType,
        subject: subjectType,
    };

    public unsubscribe?: () => void;

    public componentDidMount(): void {
        this.resubscribe();
    }

    public componentDidUpdate(): void {
        this.resubscribe();
    }

    public componentWillUnmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    public render(): ReactElement<any> | null {
        const prop = this.getLinkedObjectProperty();

        return React.createElement(
            "span",
            null,
            `PropBase: ${prop && prop.value}`,
        );
    }

    public shouldComponentUpdate(nextProps: PropTypes) {
        if (nextProps.label === undefined) {
            return false;
        }

        return this.props.subject !== nextProps.subject;
    }

    protected getLinkedObjectProperty(property?: NamedNode): SomeTerm | undefined {
        if (property === undefined && typeof this.props.linkedProp !== "undefined") {
            return this.props.linkedProp;
        }

        return this.context.getResourceProperty(
            this.props.subject,
            property || this.props.label,
        );
    }

    protected getLinkedObjectPropertyRaw(property?: SomeNode): Quad[] {
        return this.context.getResourcePropertyRaw(
            this.props.subject,
            property || this.props.label,
        );
    }

    protected resubscribe(props: T = this.props) {
        let unsubscribe;
        const subs = normalizeDataSubjects(props);
        if (subs.length > 0) {
            unsubscribe = this.context.subscribe({
                callback: () => this.forceUpdate(),
                markedForDelete: false,
                onlySubjects: true,
                subjectFilter: subs,
            });
        }
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.unsubscribe = unsubscribe;
    }
}
