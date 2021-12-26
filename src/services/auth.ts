import bcrypt from 'bcrypt'

export default class AuthService {
  public static async hashPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    const hash = await bcrypt.hash(password, salt)

    return hash
  }

  public static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hash)

    return isValid
  }
}
