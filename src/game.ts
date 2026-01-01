import kaplay from "kaplay";

const k: any = kaplay({
    background: [15, 15, 18],
    global: false,
});

k.loadRoot("./");

export default k;
