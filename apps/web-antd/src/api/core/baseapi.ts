export class BaseApi {

  /**
   * 基础服务url
   * @private
   */
  public serviceUrl: string;

  /**
   * 开启微服务
   * @protected
   */
  public openService: boolean;

  private serviceUrlList: string[];
  private baseUrl: string;
  private requestUrl: string = "";

  /**
   * 构造器
   * @param serviceUrl
   */
  constructor(serviceUrl: string) {
    // 服务 url
    this.serviceUrl = serviceUrl;
    // 是否开启分布式微服务接口路由
    this.openService = import.meta.env.VITE_MICRO_SERVICE

    this.serviceUrlList = this.serviceUrl.split("/");
    this.baseUrl = this.serviceUrlList[1];
    for (let i = 2; i < this.serviceUrlList.length; i++) {
      this.requestUrl += `/${this.serviceUrlList[i].toString()}`;
    }
  }


  parseUrl(url: string): string {

  }



  /**
   * 获取request url
   * @param url
   */
  getServiceUrl(url: string): string {
    if (this.openService == 'true') {
      return `${this.serviceUrl}${this.requestUrl}/${url}`;
    }
    return `${this.requestUrl}/${url}`;
  }
}
