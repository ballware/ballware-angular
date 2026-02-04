import { StatisticService } from '@ballware/meta-services';
import { Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';

export const mockedStatisticServiceContext = () => {

    // Setters
    const setIdentifier = jest.fn();
    const setStatistic = jest.fn();
    const setHeadParams = jest.fn();
    const setCustomParam = jest.fn();

    // Observables
    const statistic$ = new BehaviorSubject<string|undefined>(undefined);
    const customParam$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);
    const headParams$ = new BehaviorSubject<any>(undefined);
    const metadata$ = new BehaviorSubject<any>(undefined);
    const name$ = new BehaviorSubject<string|undefined>(undefined);
    const layout$ = new BehaviorSubject<any>(undefined);
    const data$ = new BehaviorSubject<Array<Record<string, unknown>>|undefined>(undefined);
    const argumentAxisCustomizeText$ = new BehaviorSubject<any>(undefined);

    return {
        setIdentifier,
        setStatistic,
        setHeadParams,
        setCustomParam,

        statistic$,
        customParam$,
        headParams$,
        metadata$,
        name$,
        layout$,
        data$,
        argumentAxisCustomizeText$,

        mock: new Mock<StatisticService>()
            .setup(instance => instance.setIdentifier).returns(setIdentifier)
            .setup(instance => instance.setStatistic).returns(setStatistic)
            .setup(instance => instance.setHeadParams).returns(setHeadParams)
            .setup(instance => instance.setCustomParam).returns(setCustomParam)
            .setup(instance => instance.statistic$).returns(statistic$)
            .setup(instance => instance.customParam$).returns(customParam$)
            .setup(instance => instance.headParams$).returns(headParams$)
            .setup(instance => instance.metadata$).returns(metadata$)
            .setup(instance => instance.name$).returns(name$)
            .setup(instance => instance.layout$).returns(layout$)
            .setup(instance => instance.data$).returns(data$)
            .setup(instance => instance.argumentAxisCustomizeText$).returns(argumentAxisCustomizeText$)
    };
}

describe('mockedStatisticServiceContext', () => {
    it('should be ignored', () => {});
});

