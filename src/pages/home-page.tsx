import { useRoleStore } from '../stores/role-store'
import { SalesmanHome } from './role-homes/salesman-home'
import { BuyerHome } from './role-homes/buyer-home'
import { BuilderHome } from './role-homes/builder-home'
import { ManagerHome } from './role-homes/manager-home'

export function HomePage() {
  const role = useRoleStore((state) => state.role)

  switch (role) {
    case 'salesman':
      return <SalesmanHome />
    case 'buyer':
      return <BuyerHome />
    case 'builder':
      return <BuilderHome />
    case 'manager':
    default:
      return <ManagerHome />
  }
}
