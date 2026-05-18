export interface OdePoint {
    x: number;
    y: number;
    yExact: number;
}

export interface OdeResult {
    methodName: string;
    points: OdePoint[];
    errorRunge: number;
    errorExact: number;
}

export interface OdeRequest {
    equationId: number;
    x0: number;
    y0: number;
    xn: number;
    h: number;
    epsilon: number;
}

export interface Equation {
    id: number;
    formula: string;
}