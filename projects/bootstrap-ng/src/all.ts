import { BS_ACCORDION } from 'bootstrap-ng/accordion';
import { BsAlert } from 'bootstrap-ng/alert';
import { BsAvatar } from 'bootstrap-ng/avatar';
import { BsBadge } from 'bootstrap-ng/badge';
import { BS_BREADCRUMB } from 'bootstrap-ng/breadcrumb';
import { BsButton } from 'bootstrap-ng/button';
import { BS_BUTTON_GROUP } from 'bootstrap-ng/button-group';
import { BsCalendar } from 'bootstrap-ng/calendar';
import { BS_CAROUSEL } from 'bootstrap-ng/carousel';
import { BsChip, BsChipDismiss, BsChipInput } from 'bootstrap-ng/chips';
import { BsCloseButton } from 'bootstrap-ng/close-button';
import { BS_COLLAPSE } from 'bootstrap-ng/collapse';
import {
  BsCombobox,
  BsComboboxMenu,
  BsComboboxNoResults,
  BsComboboxOption,
  BsComboboxSearch,
} from 'bootstrap-ng/combobox';
import { BsDatepicker, BsDatepickerDisplay } from 'bootstrap-ng/datepicker';
import { BS_DIALOG, BsDrawer, BsDrawerToggle } from 'bootstrap-ng/dialog';
import { BsFileDropzone } from 'bootstrap-ng/file-dropzone';
import {
  BsCheck,
  BsControl,
  BsFormAdorn,
  BsFormAdornIcon,
  BsFormAdornText,
  BsFormControl,
  BsFormField,
  BsFormFloating,
  BsFormLabel,
  BsFormText,
  BsInputGroup,
  BsInputGroupText,
  BsInvalidFeedback,
  BsLabel,
  BsRadio,
  BsRange,
  BsRangeInput,
  BsSwitch,
  BsSwitchInput,
  BsValidate,
  BsValidFeedback,
} from 'bootstrap-ng/forms';
import { BS_LIST_GROUP } from 'bootstrap-ng/list-group';
import { BS_MENU } from 'bootstrap-ng/menu';
import { BS_NAV } from 'bootstrap-ng/nav';
import { BsOtp, BsOtpInput } from 'bootstrap-ng/otp-input';
import { BsPagination } from 'bootstrap-ng/pagination';
import { BsPlaceholder } from 'bootstrap-ng/placeholder';
import { BsPopover } from 'bootstrap-ng/popover';
import { BS_PROGRESS } from 'bootstrap-ng/progress';
import { BsRating, BsRatingStar } from 'bootstrap-ng/rating';
import { BsScrollspy } from 'bootstrap-ng/scrollspy';
import { BsSpinner } from 'bootstrap-ng/spinner';
import { BS_STEPPER } from 'bootstrap-ng/stepper';
import { BsStrength, BsStrengthText } from 'bootstrap-ng/strength';
import { BS_TABS } from 'bootstrap-ng/tabs';
import { BS_TOAST } from 'bootstrap-ng/toast';
import { BsToggler } from 'bootstrap-ng/toggler';
import { BsTooltip } from 'bootstrap-ng/tooltip';

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
  BsFileDropzone,
] as const;

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
