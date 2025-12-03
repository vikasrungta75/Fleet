export const styleVertical = {
    verticalAlign: 'middle',
};

export const IconTripSummary: any = {
    "trip_count": "LocationOn",
    "fuel_used": "FactCheck",
    "distance": "Navigation",
    "engine_hours": "Engineering",
    "idle_time": "PendingActions",
    "driver_score": "Score",
}

export const colorsChartOption=  [
    '#17becf',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#aec7e8',
    '#ffbb78',
    '#98df8a',
    '#ff9896',
    '#c5b0d5',
    '#c49c94',
]

export function shuffleArray(arr: any) {
    const shuffledArray = arr.slice(); // Create a copy of the original array

    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[i],
        ];
    }

    return shuffledArray;
}