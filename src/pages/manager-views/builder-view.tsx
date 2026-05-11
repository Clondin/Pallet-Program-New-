import { BuilderHome } from '../role-homes/builder-home'
import { ViewAsBanner } from './view-as-banner'

export function ManagerBuilderView() {
  return (
    <>
      <ViewAsBanner label="Builder" />
      <BuilderHome />
    </>
  )
}
