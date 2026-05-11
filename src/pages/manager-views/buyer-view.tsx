import { BuyerHome } from '../role-homes/buyer-home'
import { ViewAsBanner } from './view-as-banner'

export function ManagerBuyerView() {
  return (
    <>
      <ViewAsBanner label="Buyer" />
      <BuyerHome />
    </>
  )
}
