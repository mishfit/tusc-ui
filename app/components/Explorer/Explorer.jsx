import React from "react";
import {Link} from "react-router-dom";
import Witnesses from "./Witnesses";
import CommitteeMembers from "./CommitteeMembers";
import FeesContainer from "../Blockchain/FeesContainer";
import BlocksContainer from "./BlocksContainer";
import AssetsContainer from "./AssetsContainer";
import AccountsContainer from "./AccountsContainer";
import counterpart from "counterpart";
import MarketsContainer from "../Exchange/MarketsContainer";
import {Tabs} from "bitshares-ui-style-guide";
import MetaTag from "../Layout/MetaTag";
import HoldersContainer from "./HoldersContainer";

class Explorer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tabs: [
                {
                    name: "blocks",
                    link: "/explorer/blocks",
                    translate: "explorer.blocks.title",
                    content: BlocksContainer
                },
                {
                    name: "assets",
                    link: "/explorer/assets",
                    translate: "explorer.assets.title",
                    content: AssetsContainer
                },
                {
                    name: "accounts",
                    link: "/explorer/accounts",
                    translate: "explorer.accounts.title",
                    content: AccountsContainer
                },
                {
                    name: "witnesses",
                    link: "/explorer/witnesses",
                    translate: "explorer.witnesses.title",
                    content: Witnesses
                },
                {
                    name: "committee_members",
                    link: "/explorer/committee-members",
                    translate: "explorer.committee_members.title",
                    content: CommitteeMembers
                },
                {
                    name: "fees",
                    link: "/explorer/fees",
                    translate: "fees.title",
                    content: FeesContainer
                },
                {
                    name: "holders",
                    link: "/explorer/holders",
                    translate: "holders.title",
                    content: HoldersContainer
                }
            ]
        };
    }

    render() {
        const onChange = value => {
            console.log("tab changed value==", value);
            if (value == "/explorer/assets") {
                this.props.history.push("/asset/TUSC");
            } else {
                this.props.history.push(value);
            }
        };

        return (
            <div>
                <MetaTag path="blocks" />
                <Tabs
                    activeKey={this.props.location.pathname}
                    animated={false}
                    style={{display: "table", height: "100%", width: "100%"}}
                    onChange={onChange}
                >
                    {this.state.tabs.map(tab => {
                        const TabContent = tab.content;

                        return (
                            <Tabs.TabPane
                                key={tab.link}
                                tab={counterpart.translate(tab.translate)}
                            >
                                <div className="padding">
                                    <TabContent />
                                </div>
                            </Tabs.TabPane>
                        );
                    })}
                </Tabs>
            </div>
        );
    }
}

export default Explorer;
