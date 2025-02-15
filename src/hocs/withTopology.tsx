import * as React from "react";

import { Omit, TopologyContextProp } from "../types";

import { Consumer } from "./withLinkCtx";

export function withTopology<P extends TopologyContextProp>(Component: React.ComponentType<P>):
    React.FunctionComponent<Omit<P, keyof TopologyContextProp>> {

    return (props: Omit<P, keyof TopologyContextProp>) => (
        <Consumer>
            {({ topology }) => {
                const merged = { ...props, topology } as P;

                return <Component {...merged} />;
            }}
        </Consumer>
    );
}
