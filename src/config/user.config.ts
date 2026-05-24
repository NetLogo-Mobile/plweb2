import i18n from '@i18n/index'
import storageManager from '../services/storage'
import { showDialog, showNotification } from '@popup/naiveui'

type SupportedLocale = 'English' | 'Chinese' | 'German' | 'Japanese' | 'French'

function createLanguageOptions() {
  return [
    {
      label: i18n.global.t('settings.languageOptions.chinese'),
      value: 'Chinese',
    },
    {
      label: i18n.global.t('settings.languageOptions.english'),
      value: 'English',
    },
    {
      label: i18n.global.t('settings.languageOptions.german'),
      value: 'German',
    },
    {
      label: i18n.global.t('settings.languageOptions.japanese'),
      value: 'Japanese',
    },
    {
      label: i18n.global.t('settings.languageOptions.french'),
      value: 'French',
    },
  ]
}

function createDebuggerOptions() {
  return [
    { label: i18n.global.t('settings.debuggerOptions.on'), value: 'on' },
    { label: i18n.global.t('settings.debuggerOptions.off'), value: 'off' },
  ]
}

export const settingsConfig = [
  {
    title: 'general',
    items: [
      {
        key: 'language',
        label: i18n.global.t('settings.language'),
        type: 'link',
        value: 'Chinese',
        options: createLanguageOptions(),
        callBack: (newValue: string) => {
          i18n.global.locale.value = newValue as SupportedLocale
          const generalItems = settingsConfig[0]?.items || []
          const languageItem = generalItems.find((item) => item.key === 'language')
          const debuggerItem = generalItems.find((item) => item.key === 'debugger')
          if (languageItem?.type === 'link') {
            languageItem.options = createLanguageOptions()
          }
          if (debuggerItem?.type === 'link') {
            debuggerItem.options = createDebuggerOptions()
          }
          // Save language setting to localStorage
          const userConfig = storageManager.getObj('userConfig')?.value || {}
          userConfig.language = newValue
          userConfig.languageManuallySelected = true
          storageManager.setObj('userConfig', userConfig)
          window.$Logger.logEvent({
            category: 'Account',
            action: 'Switch-Language',
            label: newValue,
            timestamp: Date.now(),
          })
          showDialog('info', {
            title: i18n.global.t('settings.languageChangeTitle'),
            content: i18n.global.t('settings.languageChangeContent'),
            positiveText: i18n.global.t('login.confirm'),
            onPositiveClick: () => {
              showNotification({
                type: 'success',
                title: i18n.global.t('settings.languageChangeTitle'),
              })
            },
          })
        },
      },
      {
        key: 'debugger',
        label: i18n.global.t('settings.debugger'),
        type: 'link',
        value: 'on',
        options: createDebuggerOptions(),
        callBack: (newValue: string) => {
          if (newValue === 'off') {
            localStorage.removeItem('error_logs')
          }
          showDialog('warning', {
            title: i18n.global.t('login.reLogin'),
            content: i18n.global.t('login.reLoginContent'),
            positiveText: i18n.global.t('login.confirm'),
            onPositiveClick: async () => {
              storageManager.remove('userInfo')
              storageManager.remove('userAuthInfo')
              window.$Logger.logEvent({
                category: 'Account',
                action: 'Toggle-Error-Logger',
                label: newValue,
                timestamp: Date.now(),
              })
            },
          })
        },
      },
      {
        key: 'autoOpenCopiedLink',
        label: i18n.global.t('settings.autoOpenCopiedLink'),
        type: 'toggle',
        value: 'off',
      },
      {
        key: 'exportLogs',
        label: i18n.global.t('settings.exportLogs'),
        type: 'button',
        callBack: () => {
          window.$ErrorLogger.exportToTxt()
          window.$Logger.logEvent({
            category: 'Account',
            action: 'Export-Error-Logs',
            timestamp: Date.now(),
          })
        },
      },
      // {
      //   key: "",
      //   label: "如题",
      //   type: "toggle",
      //   value: false,
      // },
    ],
  },
]
