// import it as "@popup/index"
// Only JavaScript logic will be stored here, and all elements will be independent Vue instances separate from the root element APP.
// Some components (such as the specific content of the popup) will be written under components/popup/

// 本文件作为弹出框服务的入口，可以通过"@popup"来引用
// 这里只会存储js逻辑，并且所有的元素脱离根元素APP而独立成为新的Vue实例
// 一些组件（例如弹出框的具体内容会写在components/popup/下）
import showLoginModel from "./loginModel";
import {
  showDialog,
  showLoadingBar,
  showMessage,
  showModal,
  showNotification,
} from "./naiveui";
import showUserProfileDialog from "./userProfileDialog";

export {
  showMessage,
  showDialog,
  showLoadingBar,
  showModal,
  showNotification,
  showUserProfileDialog,
  showLoginModel,
};
