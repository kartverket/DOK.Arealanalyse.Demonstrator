const maskMotion = {
    motionAppear: true,
    motionName: 'mask-motion',
    onAppearEnd: console.warn,
};

const motion = placement => ({
    motionAppear: true,
    motionName: `panel-motion-${placement}`,
    motionDeadline: 1000
});

export const motionProps = {
    maskMotion,
    motion,
};

export function getResult(resultList, resultId) {
    return Object.values(resultList)
        .flat()
        .find(result => result.id === resultId) || null;
}