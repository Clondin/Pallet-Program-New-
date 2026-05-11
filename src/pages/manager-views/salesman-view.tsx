import { SalesmanHome } from '../role-homes/salesman-home'
import { ViewAsBanner } from './view-as-banner'

export function ManagerSalesmanView() {
  return (
    <>
      <ViewAsBanner label="Salesman" />
      <SalesmanHome />
    </>
  )
}
