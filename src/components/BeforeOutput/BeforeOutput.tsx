import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parse } from 'query-string';

import Output from '~/components/Output';
import useLocalStorage from '~/hooks/useLocalStorage';
import usePostMessage from '~/hooks/usePostMessage';
import { Dispatch, RootState } from '~/redux/store';
import { queryTemplateById } from '~/api';
import isType from '~/core/helper/isType';

interface Props {}

const BeforeOutput: React.FC<Props> = () => {
  const { updateAppData } = useDispatch<Dispatch>().appData;
  const { updatePage } = useDispatch<Dispatch>().pageData;
  const { setCurrentEditorStylePath } = useDispatch<Dispatch>().controller;

  const pageData = useSelector((state: RootState) => state.pageData);

  // 页面准备状态
  const [isAppdataReady, setIsAppdataReady] = useState(false);
  const [isPagedataReady, setIsPagedataReady] = useState(false);

  // 获取缓存的页面数据与模块数据
  const [appDataLocalStoreData] = useLocalStorage('appData', null);
  const [pageDataLocalStoreData] = useLocalStorage('pageData', null);

  // 用于编辑模式下，观察编辑器通知，设置当前编辑路径
  const sendMessage = usePostMessage((data) => {
    const { tag, value } = data;
    if (tag === 'setCurrentEditorStylePath') {
      setCurrentEditorStylePath(value);
    }
  });

  // 同步App数据
  const asyncAppData = useCallback(
    (appData) => {
      if (appData) {
        updateAppData(appData);
        setIsAppdataReady(true);
        sendMessage(
          {
            tag: 'updateAppData',
            value: appData,
          },
          window.top,
        );
      }
    },
    [sendMessage, updateAppData],
  );

  // 同步page数据
  const asyncPageData = useCallback(
    (pageData) => {
      if (pageData) {
        updatePage(pageData);
        setIsPagedataReady(true);
        sendMessage(
          {
            tag: 'updatePage',
            value: pageData,
          },
          window.top,
        );
      }
    },
    [sendMessage, updatePage],
  );

  // 初始化App
  const setApp = useCallback(async () => {
    const { tpl } = parse(window.location.search);
    let appDataRes, pageDataRes;
    if (!tpl) {
      appDataRes = appDataLocalStoreData || [];
      pageDataRes = pageDataLocalStoreData || {};
    } else {
      const result = await queryTemplateById(tpl as string);
      if (!isType(result, 'Object')) return;
      const { appData = '"[]"', pageData = '"{}"' } = result;
      appDataRes = JSON.parse(appData);
      pageDataRes = JSON.parse(pageData);
    }
    asyncAppData(appDataRes);
    asyncPageData(pageDataRes);
  }, [
    appDataLocalStoreData,
    asyncAppData,
    asyncPageData,
    pageDataLocalStoreData,
  ]);

  useEffect(() => {
    setApp();
  }, [setApp]);

  // 底层数据将完全准备就绪，再放行App！
  if (!isAppdataReady || !isPagedataReady || !pageData) {
    return null;
  }
  return <Output pageData={pageData} />;
};

export default BeforeOutput;
