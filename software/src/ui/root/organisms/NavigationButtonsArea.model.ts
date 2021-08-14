import { router, texts } from '~/ui/base';
import { PagePaths } from '~/ui/commonModels';
import { globalSettingsReader } from '~/ui/commonStore';

export interface NavigationEntryViewModel {
  pagePath: PagePaths;
  pageName: string;
  iconSpec: string;
  isCurrent: boolean;
  onClick: () => void;
  hint: string;
}

interface NavigationEntrySource {
  pagePath: PagePaths;
  pageName: string;
  iconSpec: string;
  hint: string;
  isAvailable?: () => boolean;
}

const entrySources: NavigationEntrySource[] = [
  {
    pagePath: '/editor',
    pageName: texts.label_sideMenu_app_assigner,
    iconSpec: 'fa fa-keyboard',
    hint: texts.hint_sideMenu_app_assigner,
  },
  {
    pagePath: '/layouter',
    pageName: texts.label_sideMenu_app_layouter,
    iconSpec: 'fa fa-drafting-compass',
    hint: texts.hint_sideMenu_app_layouter,
  },
  {
    pagePath: '/presetBrowser',
    pageName: texts.label_sideMenu_app_presetBrowser,
    iconSpec: 'fa fa-book',
    hint: texts.hint_sideMenu_app_presetBrowser,
  },
  {
    pagePath: '/presetBrowser2',
    pageName: 'Presets2',
    iconSpec: 'fa fa-book',
    hint: texts.hint_sideMenu_app_presetBrowser,
  },
  {
    pagePath: '/shapePreview',
    pageName: texts.label_sideMenu_app_shapePreview,
    iconSpec: 'fa fa-file-code',
    hint: texts.hint_sideMenu_app_shapePreview,
    isAvailable: () => globalSettingsReader.isDeveloperMode,
  },
  {
    pagePath: '/firmwareUpdation',
    pageName: texts.label_sideMenu_app_firmwareUpdation,
    iconSpec: 'fa fa-microchip',
    hint: texts.hint_sideMenu_app_firmwareUpdation,
  },
  {
    pagePath: '/projectEdit',
    pageName: 'project',
    iconSpec: 'fa fa-globe',
    hint: 'project edit',
    // isAvailable: () => globalSettingsModel.isLocalProjectSelectedForEdit,
    isAvailable: () => false,
  },
  {
    pagePath: '/projectSelection',
    pageName: texts.label_sideMenu_app_projectSelection,
    iconSpec: 'fa fa-globe',
    hint: 'project selection',
  },
  {
    pagePath: '/settings',
    pageName: texts.label_sideMenu_app_settings,
    iconSpec: 'fa fa-cog',
    hint: texts.hint_sideMenu_app_settings,
  },
  {
    pagePath: '/home',
    pageName: 'entrance',
    iconSpec: 'fa fa-door-open',
    hint: 'start',
  },
];

// const entrySources: NavigationEntrySource[] = [
//   { pagePath: '/editor', pageName: 'Assigner', iconSpec: 'keyboard' },
//   {
//     pagePath: '/layouter',
//     pageName: 'Drafter',
//     iconSpec: 'architecture',
//   },
//   { pagePath: '/presetBrowser', pageName: 'Presets', iconSpec: 'menu_book' },
//   { pagePath: '/shapePreview', pageName: 'Preview', iconSpec: 'format_shapes' },
//   {
//     pagePath: '/firmwareUpdation',
//     pageName: 'Firmware',
//     iconSpec: 'memory',
//   },
//   { pagePath: '/settings', pageName: 'Settings', iconSpec: 'settings' },
// ];

export interface INavigationViewModel {
  entries: NavigationEntryViewModel[];
}

export function makeNavigationViewModel(): INavigationViewModel {
  const currentPagePath = router.getPagePath();
  return {
    entries: entrySources
      .filter((it) => (it.isAvailable ? it.isAvailable() : true))
      .map((it) => ({
        pagePath: it.pagePath,
        pageName: it.pageName,
        iconSpec: it.iconSpec,
        hint: it.hint,
        isCurrent: it.pagePath === currentPagePath,
        onClick: () => router.navigateTo(it.pagePath),
      })),
  };
}
