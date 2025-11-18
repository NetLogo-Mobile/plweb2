import { createApp } from "vue";
import UserCard from "../../components/popup/userProfileDialog.vue";
import i18n from "@i18n/index";

/**
 * To open a user information card without handling any other events
 * @param {string} userid
 */
export default async function showUserProfileDialog(userid: string) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const app = createApp(UserCard, {
    userid,
    close: () => {
      app.unmount();
      div.remove();
    },
  });
  app.use(i18n);
  app.mount(div);
}
