import { Beach, BeachPosition } from '@src/models/beach'
import { Rating } from '../rating'

const beachFake: Beach = {
  lat: -33.792726,
  lng: 151.289824,
  name: 'Manly',
  position: BeachPosition.E,
  user: 'fake-user-id'
}
let defaultRating: Rating

describe('Rating Service', () => {
  beforeEach(() => {
    defaultRating = new Rating(beachFake)
  })
  describe('Calculate rating for a given point', () => {
    // TODO: Implement tests
  })

  describe('Calculate rating based on wind and wave positions', () => {
    let windAndWaveBasedClassification: (
      beach: Beach,
      windPosition: BeachPosition
    ) => number

    beforeEach(() => {
      windAndWaveBasedClassification = (
        beach: Beach,
        windPosition: BeachPosition
      ): number => {
        return defaultRating.getRatingBasedOnWindAndWavePositions(
          beach.position,
          windPosition
        )
      }
    })
    it('Should get rating 1 for a beach with onshore winds', () => {
      const windFake = { position: BeachPosition.E }
      const rating = windAndWaveBasedClassification(
        beachFake,
        windFake.position
      )

      expect(rating).toBe(1)
    })

    it('Should get rating 3 for a beach with cross winds', () => {
      const windFake = { position: BeachPosition.S }
      const rating = windAndWaveBasedClassification(
        beachFake,
        windFake.position
      )

      expect(rating).toBe(3)
    })

    it('Should get rating 3 for a beach with offshore winds', () => {
      const windFake = { position: BeachPosition.W }
      const rating = windAndWaveBasedClassification(
        beachFake,
        windFake.position
      )

      expect(rating).toBe(5)
    })
  })
})
