import { ForecastPoint } from '@src/clients/stormGlass'
import { Beach, GeoPosition } from '@src/models/beach'

const waveHeights = {
  ankleToKnee: {
    min: 0.2,
    max: 0.69
  },
  kneeToWaist: {
    min: 0.7,
    max: 1.49
  },
  waistHigh: {
    min: 1.5,
    max: 1.9
  },
  headHigh: {
    min: 2.0
  }
}

export class Rating {
  constructor(private beach: Beach) {}

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): number {
    if (wavePosition === windPosition) {
      return 1
    } else if (this.isWindOfShore(wavePosition, windPosition)) {
      return 5
    }
    return 3
  }

  private isWindOfShore(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): boolean {
    return (
      (wavePosition === GeoPosition.N &&
        windPosition === GeoPosition.S &&
        this.beach.position === GeoPosition.N) ||
      (wavePosition === GeoPosition.S &&
        windPosition === GeoPosition.N &&
        this.beach.position === GeoPosition.S) ||
      (wavePosition === GeoPosition.E &&
        windPosition === GeoPosition.W &&
        this.beach.position === GeoPosition.E) ||
      (wavePosition === GeoPosition.W &&
        windPosition === GeoPosition.E &&
        this.beach.position === GeoPosition.W)
    )
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period <= 5) {
      return 1
    }
    if (period > 5 && period <= 9) {
      return 2
    }
    if (period > 9 && period <= 13) {
      return 4
    }
    return 5
  }

  public getRatingForSwellSize(height: number): number {
    if (height < waveHeights.ankleToKnee.min) {
      return 1
    }
    if (
      height >= waveHeights.ankleToKnee.min &&
      height <= waveHeights.ankleToKnee.max
    ) {
      return 2
    }
    if (
      height >= waveHeights.kneeToWaist.min &&
      height <= waveHeights.kneeToWaist.max
    ) {
      return 3
    }
    if (
      height >= waveHeights.waistHigh.min &&
      height <= waveHeights.waistHigh.max
    ) {
      return 4
    }
    return 5
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates >= 45 && coordinates <= 135) {
      return GeoPosition.E
    }
    if (coordinates > 135 && coordinates < 225) {
      return GeoPosition.S
    }
    if (coordinates >= 225 && coordinates <= 315) {
      return GeoPosition.W
    }
    return GeoPosition.N
  }

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection)
    const windDirection = this.getPositionFromLocation(point.windDirection)
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    )
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight)
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod)
    const finalRating =
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3

    return Math.round(finalRating)
  }
}
