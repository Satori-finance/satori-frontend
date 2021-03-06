import React, {useMemo} from 'react';
import { useTranslation } from 'react-i18next';
import {PositionStyle} from './styles/Position.style';
import Table from "src/components/table/Table";
import OperationBtn from "../../components/OperationBtn/OperationBtn";
import Pagination from "../../components/pagination/Pagination";
import {getOrderType} from "../exchange/config";
import {useEffectState} from "../../hooks/useEffectState";
import {useFetchPostPage} from "../../ajax";
import {getPositionList, IPositionList} from "../../ajax/contract/contract";
import {useStore} from "react-redux";
import {IState} from "../../store/reducer";
import Loading from "../../components/loadStatus/Loading";
import Toggle from "../../components/toggle/Toggle";
import NotConnect from "../../components/NotConnect/NotConnect";
import EmptyData from "../../components/noData/EmptyData";
import {RowStyle} from "../exchange/record/style";
import {$router} from "../../react-router-perfect/Index";

const data = [
    { name: "BTC/USDT", icon: require("src/assets/images/icon_pairs_buy@2x.png"), isLong: true,Leverage: 10, average: "1.078236", LiquidationPrice: "1.07", amount: "6.998", Margin: "1,297.60", Unrealized: "1.894541 (-129.35%)" },
    { name: "BTC/USDT", icon: require("src/assets/images/icon_pairs_sell@2x.png"), isLong: false,Leverage: 5, average: "1.078236", LiquidationPrice: "1.07", amount: "6.998", Margin: "1,297.60", Unrealized: "1.894541 (-129.35%)" }
];

type IRow = {
    item: IPositionList
}
function Row(props: IRow) {
    const {t} = useTranslation();

    const rowClassName = useMemo(() => {
        if (!props.item.unrealizedPnl || Number(props.item.unrealizedPnl) === 0) {
            return "";
        }
        return Number(props.item.unrealizedPnl) > 0 ? "long" : "short";
    }, [props.item.unrealizedPnl]);

    const operaInfo = useMemo(() => {
        let obj = {
            className: "",
            value: ""
        };
        if (Number(props.item.unrealizedPnl) > 0) {
            obj.className = 'long';
            obj.value = `+${props.item.unrealizedPnl}`
        } else {
            obj.className = 'short';
            obj.value = `${props.item.unrealizedPnl}`
        }
        return obj;
    }, [props.item.unrealizedPnl]);

    return <>
        <tr style={{lineHeight: "42px"}}>
            <td>
                <span className={"name"}>{props.item.symbol}</span>
            </td>
            <td className={`${props.item.isLong ? 'long' : 'short'}`}>{getOrderType(props.item.isLong, t)}</td>
            <td>{props.item.lever}x</td>
            <td>{props.item.quantity} {props.item.symbol.split("-")[0]}</td>
            <td>{props.item.openingPrice}</td>
            <td>{Number(props.item.restrictPrice) < 0 ? "--" : props.item.restrictPrice}</td>
            <td>{props.item.marginAmount}</td>
            <td className={ operaInfo.className }>{operaInfo.value}</td>
            <td>
                <OperationBtn style={{background: "transparent"}} onClick={() => {
                    $router.push({
                        pathname: "/",
                        query: {pairId: props.item.contractPairId}
                    })
                }}>{t(`Check`)}</OperationBtn>
            </td>
        </tr>
    </>
}

export default function Position() {
    const {t} = useTranslation();
    const store = useStore<IState>();
    const storeData = store.getState();
    const state = useEffectState({
        pageNo: 1,
        pageSize: 10
    });

    /* Currently selected trading pairs */
    /*const pairInfo = useMemo(() => {
        return reducerState.pairs[reducerState.currentTokenIndex] || {};
    }, [reducerState.pairs, reducerState.currentTokenIndex]);*/

    const {data, loading, total, reload} = useFetchPostPage<IPositionList>(getPositionList, {
        pageNo: state.pageNo,
        pageSize: state.pageSize
    }, [storeData.token]);

    return (
        <PositionStyle>
            { loading ? <Loading /> :null }
            <Toggle vIf={!!storeData.token}>
                <Table className={"table"}>
                    <thead>
                    <tr>
                        <th>{t(`Pairs`)}</th>
                        <th>{t(`Type`)}</th>
                        <th>{t(`Leverage`)}</th>
                        <th>{t(`Cont`)}</th>
                        <th>{t(`Enter price`)}</th>
                        <th>{t(`Liquid. Price`)}</th>
                        <th>{t(`Margin`)}</th>
                        <th style={{width: "16%"}}>{t(`Unrealiz. PnL`)}</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        data.map((item, index) => {
                            return <Row key={index} item={item}></Row>
                        })
                    }
                    </tbody>
                </Table>
                <NotConnect></NotConnect>
            </Toggle>
            <Toggle vIf={total === 0 && !!storeData.token}>
                <EmptyData style={{marginTop: "78px"}} />
            </Toggle>
            <Toggle vIf={!!total && total > state.pageSize}>
                <Pagination onChange={(page) => state.pageNo = page} total={total || 0} />
            </Toggle>
        </PositionStyle>
    )
}
