import { Card, Input, Typography } from 'antd'

import { MobilePage } from 'shared/ui/MobilePage'

export default function Profile() {
  return (
    <MobilePage>
      <Card className="rounded-[22px] border-[#e7e2dc] shadow-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Typography.Text className="text-[16px] font-semibold text-[#171411]">
              Клиент
            </Typography.Text>
            <Input value='ООО "Красмаш"' readOnly />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <Typography.Text className="text-[16px] font-semibold text-[#171411]">
                Дата ввода в эксплуатацию
              </Typography.Text>
              <Input value="12.12.2025" readOnly />
            </div>

            <div className="flex flex-col gap-1">
              <Typography.Text className="text-[16px] font-semibold text-[#171411]">
                Часы наработки
              </Typography.Text>
              <Input value="32" readOnly />
            </div>
          </div>
        </div>
      </Card>
    </MobilePage>
  )
}
