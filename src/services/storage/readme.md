### storage interfaces

Storage manager(alias: sm?) uses localStorage to store small data, and indexDB to cache API data. Maybe we'll use settion storage(based on user config) one day.

In the future, for example, when opening messages board, we need to wait for fetching  data before rendering. Instead, query in the local database and render it immediately, then compare with server response amd update.Offline pages may also be served through this middleware layer.

Tips: when user logput, we'll use `localStorage.clear()` derectly

storageManager（被奇怪的缩写为sm）使用localStorage存小数据，（计划）indexDB缓存API，日后可能依据用户配置启用settionstoragre。

未来 比如打开留言板，不毕等待及时数据，先从本地存储的数据库里面查询后渲染，再校验并由Vue自动最小化更新渲染（因为这些数据一般是不会变的！）这还可以支持离线页面。

注意：用户登出时会直接使用`localStorage.clear()`清除数据