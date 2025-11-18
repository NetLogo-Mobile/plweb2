## API Inreface

For static image resources, we will use service workers in the future to replace failed network communications with our default images.

And for other data exchanges, directly access the getData function in any component or script. **The return value of the function is not the original data from the API**, but rather data that has been processed, which matches the format of the API interface and is intended to be rendered on the page.

For example: In the front end, we use beforeRequest to directly return `{Status:403,Data:bull,message:Too many request}` for high-frequency getData calls.

For example: (hypothetically) we can customize the homepage data(using  content/getExps for example). When calling this path, we actually execute multiple concurrent getLibrary requests and finally combine these requests into a format that matches the authcate interface return value. In Home.vue, just directly use loadPageData regardless of what the return value is.

It is worth mentioning that it has something to do with our storage interface.

对于静态图片资源，我们日后会使用service worker将失败的网络通讯替换为我们的默认图片。

对于其他，在任何组件或脚本中请使用getData函数。需要注意的是，函数返回值不是API的源数据，而是经过我们项目，自己的中间层处理之后，与API接口格式一模一样的，希望被渲染到页面上的数据。

例如：在前端做校验，使用beforeRequest对过高频率的getData调用直接返回`{Status:403,Data:bull,message:Too many request}`。

例如：（假设）我们可以自定义首页数据，在Home.vue请求：content/getExps，使用beforeRequest拦截，实际上执行并发多个getLibrary请求，合并成符合authcate接口返回值的格式。在Home.vue不用考虑太多，对于结果一律loadPageData就行。

同时留意本设计与缓存的关系。