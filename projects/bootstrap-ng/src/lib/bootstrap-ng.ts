import {
  BsAccordion,
  BsAccordionBody,
  BsAccordionHeader,
  BsAccordionItem,
} from './accordion/accordion';
import { BsAlert } from './alert/alert';
import { BsAvatar } from './avatar/avatar';
import { BsBadge } from './badge/badge';
import { BsBreadcrumb, BsBreadcrumbLink } from './breadcrumb/breadcrumb';
import { BsButton } from './button/button';
import { BsButtonGroup, BsButtonToolbar } from './button-group/button-group';
import {
  BsCarousel,
  BsCarouselIndicator,
  BsCarouselItem,
  BsCarouselNext,
  BsCarouselPlayPause,
  BsCarouselPrev,
} from './carousel/carousel';
import { BsCloseButton } from './close-button/close-button';
import { BsCollapse, BsCollapseToggle } from './collapse/collapse';
import { BsDialog, BsDialogClose } from './dialog/dialog';
import { BsDrawer, BsDrawerToggle } from './drawer/drawer';
import { BsCheck, BsRadio } from './forms/check';
import { BsControl } from './forms/control';
import {
  BsFormField,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
  BsLabel,
  BsValidFeedback,
} from './forms/form-field';
import { BsFormAdorn, BsFormAdornIcon, BsFormAdornText } from './forms/form-adorn';
import { BsChip, BsChipDismiss, BsChipInput } from './forms/chips';
import {
  BsCombobox,
  BsComboboxMenu,
  BsComboboxNoResults,
  BsComboboxOption,
  BsComboboxSearch,
} from './forms/combobox';
import { BsCalendar } from './forms/calendar';
import { BsDatepicker, BsDatepickerDisplay } from './forms/datepicker';
import { BsOtp, BsOtpInput } from './forms/otp-input';
import { BsStrength, BsStrengthText } from './forms/strength';
import { BsRating, BsRatingStar } from './forms/rating';
import { BsFormControl } from './forms/form-control';
import { BsFormFloating } from './forms/floating';
import { BsInputGroup, BsInputGroupText } from './forms/input-group';
import { BsRange, BsRangeInput } from './forms/range';
import { BsSwitch, BsSwitchInput } from './forms/switch';
import { BsValidate } from './forms/validate';
import { BsListGroup, BsListGroupItem } from './list-group/list-group';
import { BsMenu, BsMenuToggle, BsSubmenu } from './menu/menu';
import { BsNav, BsNavLink } from './nav/nav';
import { BsNavOverflow } from './nav/nav-overflow';
import { BsPagination } from './pagination/pagination';
import { BsPlaceholder } from './placeholder/placeholder';
import { BsPopover } from './popover/popover';
import { BsProgress, BsProgressStacked } from './progress/progress';
import { BsScrollspy } from './scrollspy/scrollspy';
import { BsSpinner } from './spinner/spinner';
import { BsStepper, BsStepperItem } from './stepper/stepper';
import { BsTab, BsTabContent, BsTabPane, BsTabs } from './tabs/tabs';
import { BsToast, BsToastClose } from './toast/toast';
import { BsToggler } from './toggler/toggler';
import { BsTooltip } from './tooltip/tooltip';

export const BS_ACCORDION = [
  BsAccordion,
  BsAccordionItem,
  BsAccordionHeader,
  BsAccordionBody,
] as const;
export const BS_BREADCRUMB = [BsBreadcrumb, BsBreadcrumbLink] as const;
export const BS_CAROUSEL = [
  BsCarousel,
  BsCarouselItem,
  BsCarouselPrev,
  BsCarouselNext,
  BsCarouselIndicator,
  BsCarouselPlayPause,
] as const;
export const BS_COLLAPSE = [BsCollapse, BsCollapseToggle] as const;
export const BS_DIALOG = [BsDialog, BsDialogClose] as const;
export const BS_DRAWER = [BsDrawer, BsDrawerToggle, BsDialogClose] as const;
/** Form controls, field layout and validation directives. */
export const BS_FORMS = [
  BsFormField,
  BsLabel,
  BsFormLabel,
  BsFormText,
  BsInvalidFeedback,
  BsValidFeedback,
  BsControl,
  BsValidate,
  BsFormControl,
  BsCheck,
  BsRadio,
  BsSwitch,
  BsSwitchInput,
  BsRange,
  BsRangeInput,
  BsInputGroup,
  BsInputGroupText,
  BsFormFloating,
  BsFormAdorn,
  BsFormAdornIcon,
  BsFormAdornText,
  BsChip,
  BsChipDismiss,
  BsChipInput,
  BsCombobox,
  BsComboboxMenu,
  BsComboboxOption,
  BsComboboxSearch,
  BsComboboxNoResults,
  BsCalendar,
  BsDatepicker,
  BsDatepickerDisplay,
  BsOtp,
  BsOtpInput,
  BsStrength,
  BsStrengthText,
  BsRating,
  BsRatingStar,
] as const;
export const BS_BUTTON_GROUP = [BsButtonGroup, BsButtonToolbar] as const;
export const BS_LIST_GROUP = [BsListGroup, BsListGroupItem] as const;
export const BS_MENU = [BsMenu, BsMenuToggle, BsSubmenu] as const;
export const BS_NAV = [BsNav, BsNavLink, BsNavOverflow] as const;
export const BS_PROGRESS = [BsProgress, BsProgressStacked] as const;
export const BS_STEPPER = [BsStepper, BsStepperItem] as const;
export const BS_TABS = [BsTabs, BsTab, BsTabContent, BsTabPane] as const;
export const BS_TOAST = [BsToast, BsToastClose] as const;

/**
 * Every bootstrap-ng component and directive, for quick prototyping. Import single
 * components in production code so unused ones are tree-shaken.
 */
export const BOOTSTRAP_NG = [
  ...BS_ACCORDION,
  BsAlert,
  BsAvatar,
  BsBadge,
  ...BS_BREADCRUMB,
  BsButton,
  ...BS_BUTTON_GROUP,
  ...BS_CAROUSEL,
  BsCloseButton,
  ...BS_COLLAPSE,
  ...BS_DIALOG,
  ...BS_FORMS,
  BsDrawer,
  BsDrawerToggle,
  ...BS_LIST_GROUP,
  ...BS_MENU,
  ...BS_NAV,
  BsPagination,
  BsPlaceholder,
  BsPopover,
  ...BS_PROGRESS,
  BsScrollspy,
  BsSpinner,
  ...BS_STEPPER,
  ...BS_TABS,
  ...BS_TOAST,
  BsToggler,
  BsTooltip,
] as const;
