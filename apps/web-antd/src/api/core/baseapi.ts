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


  /**
   * 构造器
   * @param serviceUrl
   */
  constructor(serviceUrl: string) {
    // 服务 url
    this.serviceUrl = serviceUrl;
    // 是否开启分布式微服务接口路由
    this.openService = import.meta.env.VITE_MICRO_SERVICE
  }


  /**
   * 获取request url
   * @param url
   */
  getServiceUrl(url: string): string {
    if (this.openService == 'true') {
      return `${this.serviceUrl}/${url}`;
    }
    var newUrl: string = this.serviceUrl.substring(this.serviceUrl.lastIndexOf('/') + 1);
    return `${newUrl}/${url}`;
  }
}
