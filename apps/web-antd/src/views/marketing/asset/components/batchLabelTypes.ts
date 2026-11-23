export type AssetBatchLabelAsset =
  | 'audience'
  | 'loading_page'
  | 'material'
  | 'title';

export interface AssetBatchLabelData {
  asset: AssetBatchLabelAsset;
  targetIds: string[];
}
