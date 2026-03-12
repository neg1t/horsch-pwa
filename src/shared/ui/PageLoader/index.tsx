import logoLarge from 'shared/assets/logo.png'
import './pageLoader.scss'

interface PageLoaderProps {
  logo?: React.ReactNode
}

export const PageLoader = (props: PageLoaderProps) => {
  const { logo } = props

  return (
    <div className='page-loader'>
      <div className='page-loader__logo'>
        {logo || <img src={logoLarge} alt='' />}
      </div>
    </div>
  )
}
