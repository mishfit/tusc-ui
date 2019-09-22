import React from "react";
import FormattedAsset from "./FormattedAsset";
import ChainTypes from "./ChainTypes";
import BindToChainState from "./BindToChainState";
import utils from "common/utils";
import marketUtils from "common/market_utils";
import {ChainStore} from "tuscjs";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";
import {List} from "immutable";
import Translate from "react-translate-component";
import counterpart from "counterpart";
import AssetWrapper from "./AssetWrapper";
import ReactTooltip from "react-tooltip";
import PropTypes from "prop-types";

/**
 *  Given an asset amount, displays the equivalent value in baseAsset if possible
 *
 *  Expects three properties
 *  -'toAsset' which should be a asset id
 *  -'fromAsset' which is the asset id of the original asset amount
 *  -'amount' which is the amount to convert
 *  -'fullPrecision' boolean to tell if the amount uses the full precision of the asset
 */

class ValueStoreWrapper extends React.Component {
    render() {
        let preferredUnit = this.props.settings.get("unit") || "1.3.0";

        return <TotalValue {...this.props} toAsset={preferredUnit} />;
    }
}

ValueStoreWrapper = connect(
    ValueStoreWrapper,
    {
        listenTo() {
            return [SettingsStore];
        },
        getProps() {
            return {
                settings: SettingsStore.getState().settings
            };
        }
    }
);

class TotalBalanceValue extends React.Component {
    static propTypes = {
        balances: ChainTypes.ChainObjectsList
    };

    static defaultProps = {
        collateral: {},
        debt: {},
        openOrders: {}
    };

    render() {
        let {balances, collateral, debt, openOrders, inHeader} = this.props;
        let assets = List();
        let amounts = [];

        balances.forEach(balance => {
            if (balance) {
                assets = assets.push(balance.get("asset_type"));
                amounts.push({
                    asset_id: balance.get("asset_type"),
                    amount: parseInt(balance.get("balance"), 10)
                });
            }
        });

        for (let asset in collateral) {
            if (!assets.includes(asset)) {
                assets = assets.push(asset);
            }
        }

        for (let asset in debt) {
            if (!assets.includes(asset)) {
                assets = assets.push(asset);
            }
        }

        for (let asset in openOrders) {
            if (!assets.includes(asset)) {
                assets = assets.push(asset);
            }
        }

        return (
            <ValueStoreWrapper
                label={this.props.label}
                hide_asset={this.props.hide_asset}
                noTip={this.props.noTip}
                inHeader={inHeader}
                balances={amounts}
                openOrders={openOrders}
                debt={debt}
                collateral={collateral}
                fromAssets={assets}
            />
        );
    }
}
TotalBalanceValue = BindToChainState(TotalBalanceValue);

class AccountWrapper extends React.Component {
    static propTypes = {
        accounts: ChainTypes.ChainAccountsList.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return (
            !utils.are_equal_shallow(nextProps.accounts, this.props.accounts) ||
            !utils.are_equal_shallow(
                nextProps.hiddenAssets.toJS(),
                this.props.hiddenAssets.toJS()
            )
        );
    }

    render() {
        let balanceList = List(),
            collateral = {},
            debt = {},
            openOrders = {};

        this.props.accounts.forEach(account => {
            if (account) {
                account.get("orders") &&
                    account.get("orders").forEach((orderID, key) => {
                        let order = ChainStore.getObject(orderID);
                        if (order) {
                            let orderAsset = order.getIn([
                                "sell_price",
                                "base",
                                "asset_id"
                            ]);
                            if (!openOrders[orderAsset]) {
                                openOrders[orderAsset] = parseInt(
                                    order.get("for_sale"),
                                    10
                                );
                            } else {
                                openOrders[orderAsset] += parseInt(
                                    order.get("for_sale"),
                                    10
                                );
                            }
                        }
                    });

                account.get("call_orders") &&
                    account.get("call_orders").forEach((callID, key) => {
                        let position = ChainStore.getObject(callID);
                        if (position) {
                            let collateralAsset = position.getIn([
                                "call_price",
                                "base",
                                "asset_id"
                            ]);
                            if (!collateral[collateralAsset]) {
                                collateral[collateralAsset] = parseInt(
                                    position.get("collateral"),
                                    10
                                );
                            } else {
                                collateral[collateralAsset] += parseInt(
                                    position.get("collateral"),
                                    10
                                );
                            }
                            let debtAsset = position.getIn([
                                "call_price",
                                "quote",
                                "asset_id"
                            ]);
                            if (!debt[debtAsset]) {
                                debt[debtAsset] = parseInt(
                                    position.get("debt"),
                                    10
                                );
                            } else {
                                debt[debtAsset] += parseInt(
                                    position.get("debt"),
                                    10
                                );
                            }
                        }
                    });

                let account_balances = account.get("balances");
                account_balances &&
                    account_balances.forEach((balance, asset_type) => {
                        if (this.props.hiddenAssets.includes(asset_type)) {
                            return null;
                        }
                        let balanceAmount = ChainStore.getObject(balance);
                        if (!balanceAmount || !balanceAmount.get("balance")) {
                            return null;
                        }
                        balanceList = balanceList.push(balance);
                    });
            }
        });

        if (
            !balanceList.size &&
            !Object.keys(openOrders).length &&
            !Object.keys(debt).length
        ) {
            return (
                <span>
                    {!!this.props.label ? (
                        <span className="font-secondary">
                            <Translate content={this.props.label} />:{" "}
                        </span>
                    ) : null}{" "}
                    0
                </span>
            );
        } else {
            return (
                <TotalBalanceValue
                    {...this.props}
                    balances={balanceList}
                    openOrders={openOrders}
                    debt={debt}
                    collateral={collateral}
                />
            );
        }
    }
}
AccountWrapper = BindToChainState(AccountWrapper);

TotalBalanceValue.AccountWrapper = AccountWrapper;
export default TotalBalanceValue;
