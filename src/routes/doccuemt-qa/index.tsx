import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/doccuemt-qa/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/doccuemt-qa/"!</div>
}
