import { RestrictedMethods } from '@gnosis.pm/safe-apps-sdk'
import { AllowedFeatures } from '../../../types'
import { capitalize } from '../../../utils/formatters'

type PermissionsDisplayType = {
  displayName: string
  description: string
}

export * from './useBrowserPermissions'
export * from './useSafePermissions'

const SAFE_PERMISSIONS_TEXTS: Record<string, PermissionsDisplayType> = {
  [RestrictedMethods.requestAddressBook]: {
    displayName: 'Address Book',
    description: 'Access to your address book',
  },
}

export const getSafePermissionDisplayValues = (method: string) => {
  return SAFE_PERMISSIONS_TEXTS[method]
}

export const getBrowserPermissionDisplayValues = (feature: AllowedFeatures) => {
  return {
    displayName: capitalize(feature).replace(/-/g, ' '),
    description: `Allow to use - ${feature}`,
  }
}