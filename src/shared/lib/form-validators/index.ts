/* eslint-disable no-useless-escape */
import { type Rule } from 'effector-forms'

export const validationText = {
  required: 'Поле обязательно',
  incorrectSymbolCount: 'Неверное количество символов',
  email: 'Введенная электронная почта некорректна',
  phone: 'Введенный телефон некорректен',
  numberOnly: 'Введенное число некорректно',
  notZero: 'Не может быть 0',
}

const RequiredValidator: Rule<string | number> = {
  name: 'required',
  validator: (val) => {
    return val !== null ? val?.toString().length > 0 : val !== null
  },
  errorText: validationText.required,
}

const MinMaxValueValidator = (
  min: number,
  max: number,
): Rule<string | undefined> => {
  return {
    name: 'minMaxValue',
    validator: (val) => {
      let thatVal = val
      if (!thatVal) {
        return true
      }
      if (
        thatVal.includes(' ') ||
        thatVal.includes('-') ||
        thatVal.includes('_')
      ) {
        thatVal = thatVal
          .split('-')
          .join('')
          .split('_')
          .join('')
          .split(' ')
          .join('')
      }
      return thatVal.length >= min && thatVal.length <= max
    },
    errorText: validationText.incorrectSymbolCount,
  }
}

const RequiredArrayValidator: Rule<string> = {
  name: 'requiredArray',
  validator: (val) => {
    if (Array.isArray(val) && !val.length) {
      return false
    }
    return true
  },
  errorText: validationText.required,
}

const EmailValidator: Rule<string> = {
  name: 'email',
  validator: (val) => (val ? /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i.test(val) : true),
  errorText: validationText.email,
}

const PhoneValidator: Rule<string> = {
  name: 'phone',
  errorText: validationText.phone,
  validator: (val) => {
    if (val === null || val === '') {
      return true
    }
    return /(?:([\d]{1,}?))??(?:([\d]{1,3}?))??(?:([\d]{1,3}?))??(?:([\d]{2}))??([\d]{2})$/gim.test(
      val,
    )
  },
}

const NumbersOnlyValidator: Rule<string | number> = {
  name: 'numbers',
  validator: (val) =>
    val
      .toString()
      ?.split('')
      .every((x) => '1234567890'.includes(x)),
  errorText: validationText.numberOnly,
}

const NotZero: Rule<string | number | undefined> = {
  name: 'not-zero',
  errorText: validationText.notZero,
  validator: (val) => {
    return val !== 0 && val !== '0'
  },
}

export const VALIDATORS = {
  RequiredValidator,
  MinMaxValueValidator,
  RequiredArrayValidator,
  EmailValidator,
  PhoneValidator,
  NumbersOnlyValidator,
  NotZero,
}
