import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div className="mx-auto flex justify-center items-center">
    <SignIn/>
  </div>
}