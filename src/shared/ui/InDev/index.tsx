import React from 'react'
import './styles.scss'

export const InDev: React.FC = () => {
  return (
    <div className='b-in-dev'>
      <div className='b-in-dev__items-wrap'>
        <div className='b-in-dev__marquee'>
          <div className='b-in-dev__item'>В разработке</div>
          <div className='b-in-dev__item'>В разработке</div>
          <div className='b-in-dev__item'>В разработке</div>
        </div>
        <div aria-hidden='true' className='b-in-dev__marquee'>
          <div className='b-in-dev__item'>В разработке</div>
          <div className='b-in-dev__item'>В разработке</div>
          <div className='b-in-dev__item'>В разработке</div>
        </div>
      </div>
    </div>
  )
}
