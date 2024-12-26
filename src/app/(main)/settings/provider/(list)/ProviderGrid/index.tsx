'use client';

import { Grid } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

import Card from './Card';

const useStyles = createStyles(({ css, responsive, token }) => ({
  container: css`
    display: grid;
    grid-gap: 12px;
    grid-template-columns: repeat(3, 1fr);

    width: 100%;
    ${responsive.mobile} {
      display: flex;
      flex-direction: column;
    }
  `,
  count: css`
    border-radius: 12px;
    background: ${token.colorFillSecondary};
    color: ${token.colorTextDescription};
    height: 20px;
    width: 20px;
  `,
}));

const loadingArr = Array.from({ length: 12 })
  .fill('-')
  .map((item, index) => `${index}x${item}`);

const List = memo(() => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();
  const enabledList = useAiInfraStore(aiProviderSelectors.enabledAiProviderList, isEqual);
  const disabledList = useAiInfraStore(aiProviderSelectors.disabledAiProviderList, isEqual);
  const [initAiProviderList] = useAiInfraStore((s) => [s.initAiProviderList]);

  if (!initAiProviderList)
    return (
      <Flexbox gap={12} paddingBlock={'0 16px'}>
        <Flexbox align={'center'} gap={4} horizontal>
          <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {t('list.title.enabled')}
          </Typography.Text>
        </Flexbox>
        <Grid>
          {loadingArr.map((item) => (
            <Card enabled={false} id={item} key={item} loading source={'builtin'} />
          ))}
        </Grid>
      </Flexbox>
    );

  return (
    <Flexbox gap={24} paddingBlock={'0 16px'}>
      <Flexbox gap={12}>
        <Flexbox align={'center'} gap={4} horizontal>
          <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {t('list.title.enabled')}
          </Typography.Text>
          <Center className={styles.count}>{enabledList.length}</Center>
        </Flexbox>
        <Grid>
          {enabledList.map((item) => (
            <Card {...item} key={item.id} />
          ))}
        </Grid>
      </Flexbox>
      <Flexbox gap={12}>
        <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          {t('list.title.disabled')}
        </Typography.Text>
        <Grid>
          {disabledList.map((item) => (
            <Card {...item} key={item.id} />
          ))}
        </Grid>
      </Flexbox>
    </Flexbox>
  );
});

export default List;
