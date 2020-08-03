export interface MyI {
    name: string;
}

export class MyC implements MyI {
    name: string = 'Me!';
}