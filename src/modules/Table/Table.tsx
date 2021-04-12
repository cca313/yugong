import { useCallback, useEffect, useMemo, useState } from "react";
import requester from "~/core/fetch";
import EventEmitter from "~/core/EventEmitter";
import parse from "html-react-parser";
import {
  AnyObjectType,
  AppDataElementsTypes,
  ArgumentsArray,
  ArgumentsBoolean,
  ArgumentsNumber,
  ArgumentsString,
} from "~/types/appData";
import { Modules } from "~/types/modules";
import Wrapper from "../Wrapper";
import s from "./Table.module.less";
import useStyles from "./Table.useStyle";
import classNames from "classnames";
import PullToRefresh from "rmc-pull-updown-to-refresh";
import { compilePlaceholderFromDataSource as getResult } from "~/core/getDataFromSource";
import { getArgumentsItem } from "~/core/getArgumentsTypeDataFromDataSource";

export interface TableProps extends AppDataElementsTypes {
  id: string;
  eventEmitter: EventEmitter;
}

const Table: Modules<TableProps> = (props) => {
  const { eventEmitter, events = {}, api, style } = props;
  const userClass = useStyles(style);
  const [theadDataStatu, setTheadDataStatu] = useState<
    (string | number | JSX.Element | JSX.Element[])[]
  >([]);
  const [tbodyDataStatu, setTbodyDataStatu] = useState<
    (
      | string
      | number
      | boolean
      | any[]
      | Element
      | Element[]
      | AnyObjectType
    )[][]
  >([]);
  // 保留一份源数据表格替换用
  const [copyDataSource, setCopyDataSource] = useState<any>();
  // 是否开启下拉与上拉事件
  const [pullStates, setPullStates] = useState<{
    pullDown: boolean,
    pullUp: boolean
  }>()
  // API请求 注意依赖关系
  useEffect(() => {
    const apiArguments = api?.find((item) => item.apiId === "mount");
    requester(apiArguments || {});
  }, [api]);
  // 基本事件
  useEffect(() => {
    // 执行挂载事件
    eventEmitter.emit(events.mount);
    return () => {
      // 执行卸载事件
      eventEmitter.emit(events.unmount);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**设置表格交互 */
  const setTable = useCallback(
    (isPullDown: ArgumentsBoolean, isPullUp: ArgumentsBoolean) => {
      setPullStates({
        pullDown: getArgumentsItem(isPullDown) as boolean,
        pullUp: getArgumentsItem(isPullUp) as boolean
      })
    },
    [],
  )

  /**设置表格头部 */
  const setTheadData = useCallback((args: ArgumentsArray) => {
    const data = getArgumentsItem(args);
    const result = Object.keys(data).map((key) => data[key]);
    setTheadDataStatu(result);
  }, []);

  /**设置表格数据 */
  const setTbodyData = useCallback(
    (
      dataSource: ArgumentsArray,
      isConcate: ArgumentsBoolean,
      rowMap: ArgumentsArray
    ) => {
      const data = getArgumentsItem(dataSource);
      setCopyDataSource(data);
      const concat = getArgumentsItem(isConcate);
      // 这里单独处理，定义列数据从原数据映射
      const map = rowMap.data;
      if (!Array.isArray(data)) {
        return;
      }

      const result: any[] = [];
      data.forEach((element) => {
        const temp: any[] = [];
        if (Array.isArray(map)) {
          map.forEach((item) => {
            if (item) {
              temp.push(parse(getResult(item, element)));
            }
          });
        }
        result.push(temp);
      });
      // 递增翻页
      if (concat) {
        setTbodyDataStatu(tbodyDataStatu.concat(result));
      } else {
        setTbodyDataStatu(result);
      }
    },
    [tbodyDataStatu]
  );

  /**
   * 从数据源覆写表格，做到表格项灵覆写，满足列表样式的各种变换
   *
   * */
  const overrideTbodyItem = useCallback(
    (
      rowItem: ArgumentsNumber,
      colItem: ArgumentsNumber,
      override: ArgumentsString
    ) => {
      const row = (getArgumentsItem(rowItem) as number) - 1;
      const col = (getArgumentsItem(colItem) as number) - 1;
      if (tbodyDataStatu[row] && tbodyDataStatu[row][col] && copyDataSource) {
        tbodyDataStatu[row][col] = getArgumentsItem(
          override,
          copyDataSource[row]
        );
      }
    },
    [tbodyDataStatu, copyDataSource]
  );

  /** 下拉事件*/
  const onPullDown = useCallback(async () => {
    const apiArguments = api?.find((item) => item.apiId === "pullDown");
    if (apiArguments) {
      await requester(apiArguments || {});
    }
    // 执行下拉事务
    eventEmitter.emit(events.pullDown);
  }, [api, eventEmitter, events.pullDown]);

  /** 上拉事件*/
  const onPullUp = useCallback(async () => {
    const apiArguments = api?.find((item) => item.apiId === "pullUp");
    if (apiArguments) {
      await requester(apiArguments || {});
    }
    // 执行下拉事务
    eventEmitter.emit(events.pullUp);
  }, [api, eventEmitter, events.pullUp]);

  // 向eventEmitter注册方法，向外公布
  useMemo(() => {
    eventEmitter.addEventListener("setTable", setTable);
    eventEmitter.addEventListener("setTheadData", setTheadData);
    eventEmitter.addEventListener("setTbodyData", setTbodyData);
    eventEmitter.addEventListener("overrideTbodyItem", overrideTbodyItem);
  }, [eventEmitter, overrideTbodyItem, setTbodyData, setTheadData, setTable]);

  return (
    <Wrapper {...props} maxHeight maxWidth>
      <div className={s.tablewrap}>
        <PullToRefresh
          className={s.bg_orange}
          onPullDown={onPullDown}
          disablePullUp={!pullStates?.pullUp}
          disablePullDown={!pullStates?.pullDown}
          pullDownText="左下拉更新"
          pullUpText="左上拉更新"
          onPullUp={onPullUp}
        >
          <table className={classNames(s.table, userClass.table)}>
            {theadDataStatu.length ? (
              <thead>
                <tr>
                  {theadDataStatu.map((item, index) => (
                    <th key={index} scope="col">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            {tbodyDataStatu.length ? (
              <tbody>
                {tbodyDataStatu.map((item, ind) => (
                  <tr key={ind}>
                    {item.map((itemsub, index) => (
                      <td key={index}>{itemsub}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : null}
          </table>
        </PullToRefresh>
      </div>
    </Wrapper>
  );
};

/**
 * 注册方法的静态描述与默认参数定义
 */
Table.exposeFunctions = [
  {
    name: "setTable",
    description: "设置table基本功能",
    arguments: [
      {
        type: "boolean",
        name: "允许下拉事件",
        describe: "表达式成立时允许下拉事件",
        fieldName: "isPullDown",
        data: {
          comparableAverageA: "0",
          comparableAverageB: "1",
          method: "===",
        },
      },
      {
        type: "boolean",
        name: "允许上拉事件",
        describe: "表达式成立时允许上拉事件",
        fieldName: "isPullUp",
        data: {
          comparableAverageA: "0",
          comparableAverageB: "1",
          method: "===",
        },
      },
    ],
  },
  {
    name: "setTheadData",
    description: "设置表头",
    arguments: [
      {
        type: "array",
        fieldName: "setThead",
        name: "设置表头项",
        html: true,
        describe: "设置表头标题，每项代表一列",
        data: [],
      },
    ],
  },
  {
    name: "setTbodyData",
    description: "表格数据",
    arguments: [
      {
        type: "runningTime",
        name: "数据源",
        fieldName: "dataSource",
        describe: "数据源，设置运行时或Api返回数据源",
        data: "",
      },
      {
        type: "boolean",
        name: "合并历史数据",
        describe: "设置每行内容，数据替换基于数据源！",
        fieldName: "isConcate",
        data: {
          comparableAverageA: "0",
          comparableAverageB: "1",
          method: "===",
        },
      },
      {
        type: "array",
        fieldName: "rowMap",
        name: "行值",
        html: true,
        describe: "设置每行内容，数据替换基于数据源！",
        data: [],
      },
    ],
  },
  {
    name: "overrideTbodyItem",
    description: "覆写表格，请在源数据准备完成后做覆写！",
    arguments: [
      {
        type: "number",
        fieldName: "rowItem",
        name: "行",
        describe: "tbody第几行",
        data: "",
      },
      {
        type: "number",
        fieldName: "colItem",
        name: "列",
        describe: "tbody第几列",
        data: "",
      },
      {
        type: "string",
        fieldName: "override",
        name: "覆写",
        html: true,
        describe: "覆写表格项, 数据替换基于数据源！",
        data: "",
      },
    ],
  },
];

/**
 * 发布事件的静态描述
 */
Table.exposeEvents = [
  {
    name: "mount",
    description: "挂载",
  },
  {
    name: "unmount",
    description: "卸载",
  },
  {
    name: "pullDown",
    description: "下拉",
  },
  {
    name: "pullUp",
    description: "上拉",
  },
];

/**
 * 发布默认porps
 */
Table.exposeDefaultProps = {
  layout: {
    w: 20,
  },
  style: {
    basic: {},
    table: {},
    thead: {},
    tbody: {},
    th: {},
    td: {},
    tr: {},
    rowoddfirst: {},
    rowoddlast: {},
    rowodd: {},
    roweven: {},
    coloddfirst: {},
    colevenlast: {},
    colodd: {},
    coleven: {},
  },
  styleDescription: {
    table: "表格",
    thead: "表头",
    tbody: "内容",
    th: "表头项",
    td: "内容项",
    tr: "行",
    rowoddfirst: "首行",
    rowoddlast: "末行",
    rowodd: "奇数行",
    roweven: "偶数行",
    coloddfirst: "首列",
    colevenlast: "未列",
    colodd: "奇数列",
    coleven: "偶数列",
  },
};

/**
 * 发布默认Api
 */
Table.exposeApi = [
  {
    apiId: "mount",
    name: "挂载",
  },
  {
    apiId: "pullUp",
    name: "上拉",
  },
  {
    apiId: "pullDown",
    name: "下拉",
  },
];

export default Table;
