import mongoose, { Document, Model } from 'mongoose'

export interface User {
  _id?: string
  name: string
  email: string
  password: string
}

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true, // Uma pegadinha comum para iniciantes é que a unique opção por esquemas não é um validador. É um auxiliar conveniente para construir índices exclusivos do MongoDB . Veja o FAQ para mais informações.
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: [5, 'Email must be at least 5 characters'],
      maxlength: [18, 'Email must be less than 18 characters']
    }
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      }
    }
  }
)

interface UserModel extends Omit<User, '_id'>, Document {}

// eslint-disable-next-line no-redeclare
export const User: Model<UserModel> = mongoose.model('User', schema)

export enum CUSTOM_VALIDATION {
  // eslint-disable-next-line no-unused-vars
  DUPLICATED = 'DUPLICATED'
}

schema.path('email').validate(
  async (email: string): Promise<boolean> => {
    const emailCount = await mongoose.models.User.countDocuments({ email })
    return !emailCount
  },
  'Email already in use',
  CUSTOM_VALIDATION.DUPLICATED
)
