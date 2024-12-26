import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { aiProviderService } from '@/services/aiProvider';
import { AiInfraStore } from '@/store/aiInfra/store';
import {
  AiProviderDetailItem,
  AiProviderListItem,
  CreateAiProviderParams,
} from '@/types/aiProvider';

const FETCH_AI_PROVIDER_LIST_KEY = 'FETCH_AI_PROVIDER';
const FETCH_AI_PROVIDER_ITEM_KEY = 'FETCH_AI_PROVIDER_ITEM';

export interface AiProviderAction {
  createNewAiProvider: (params: CreateAiProviderParams) => Promise<void>;
  internal_toggleAiProviderLoading: (id: string, loading: boolean) => void;
  refreshAiProviderList: () => Promise<void>;

  removeAiProvider: (id: string) => Promise<void>;
  toggleProviderEnabled: (id: string, enabled: boolean) => Promise<void>;
  updateAiProvider: (id: string, value: CreateAiProviderParams) => Promise<void>;

  useFetchAiProviderItem: (id: string) => SWRResponse<AiProviderDetailItem | undefined>;
  useFetchAiProviderList: (params?: { suspense?: boolean }) => SWRResponse<AiProviderListItem[]>;
}

export const createCrudSlice: StateCreator<
  AiInfraStore,
  [['zustand/devtools', never]],
  [],
  AiProviderAction
> = (set, get) => ({
  createNewAiProvider: async (params) => {
    await aiProviderService.createAiProvider(params);
    await get().refreshAiProviderList();
  },
  internal_toggleAiProviderLoading: (id, loading) => {
    set(
      (state) => {
        if (loading) return { aiProviderLoadingIds: [...state.aiProviderLoadingIds, id] };

        return { aiProviderLoadingIds: state.aiProviderLoadingIds.filter((i) => i !== id) };
      },
      false,
      'toggleAiProviderLoading',
    );
  },
  refreshAiProviderList: async () => {
    await mutate(FETCH_AI_PROVIDER_LIST_KEY);
  },
  removeAiProvider: async (id) => {
    await aiProviderService.deleteAiProvider(id);
    await get().refreshAiProviderList();
  },

  toggleProviderEnabled: async (id: string, enabled: boolean) => {
    get().internal_toggleAiProviderLoading(id, true);
    await aiProviderService.toggleProviderEnabled(id, enabled);
    await get().refreshAiProviderList();

    get().internal_toggleAiProviderLoading(id, false);
  },

  updateAiProvider: async (id, value) => {
    get().internal_toggleAiProviderLoading(id, true);
    await aiProviderService.updateAiProvider(id, value);
    await get().refreshAiProviderList();

    get().internal_toggleAiProviderLoading(id, false);
  },

  useFetchAiProviderItem: (id) =>
    useClientDataSWR<AiProviderDetailItem | undefined>([FETCH_AI_PROVIDER_ITEM_KEY, id], () =>
      aiProviderService.getAiProviderById(id),
    ),

  useFetchAiProviderList: (params = {}) =>
    useClientDataSWR<AiProviderListItem[]>(
      FETCH_AI_PROVIDER_LIST_KEY,
      () => aiProviderService.getAiProviderList(),
      {
        fallbackData: [],
        onSuccess: (data) => {
          if (!get().initAiProviderList) {
            set(
              { aiProviderList: data, initAiProviderList: true },
              false,
              'useFetchAiProviderList/init',
            );
            return;
          }

          set({ aiProviderList: data }, false, 'useFetchAiProviderList/refresh');
        },
        suspense: params.suspense,
      },
    ),
});
