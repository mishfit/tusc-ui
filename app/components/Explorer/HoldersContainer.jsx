import React from "react";
import AccountStore from "stores/AccountStore";
import AltContainer from "alt-container";
import Holders from "./Holders";

class HoldersContainer extends React.Component {
    render() {
        return (
            <AltContainer
                inject={{
                    searchHolders: () => {
                        return AccountStore.getState().searchHolders;
                    },
                    searchTerm: () => {
                        return AccountStore.getState().searchTerm;
                    }
                }}
            >
                <Holders />
            </AltContainer>
        );
    }
}

export default HoldersContainer;
