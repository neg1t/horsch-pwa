import React from 'react'

import { Card, Typography } from 'antd'

import { MobilePage } from 'shared/ui/MobilePage'

export const MainPage: React.FC = () => {
  return (
    <MobilePage>
      <Card className="rounded-[22px] border-[#e7e2dc] shadow-none">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Typography.Text className="text-[18px]! font-semibold! text-[#171411]!">
              Horsch Maestro 24
            </Typography.Text>
            <Typography.Text className="text-[13px]! ">
              VIN: w0h00000000003hc54372847
            </Typography.Text>
            <Typography.Text className="text-[13px]!">
              24.12.2025
            </Typography.Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Самоходная', 'Золотая нива', 'Тег 3'].map((tag) => (
              <span
                key={tag}
                className="rounded-lg border px-2 py-1 text-[12px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </MobilePage>
  )
}
