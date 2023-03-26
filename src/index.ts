import { FullScreenUtils } from "webgl-framework";
import { Renderer } from "./Renderer";
import { FreeMovement } from "./FreeMovement";
import { GUI } from 'dat.gui'

function ready(fn: () => void) {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


let renderer: Renderer;

ready(() => {
    renderer = new Renderer();
    renderer.ready = () => {
        initUI();
    };
    renderer.init("canvasGL", true);
    const canvas = document.getElementById("canvasGL")!;
    new FreeMovement(
        renderer,
        {
            canvas,
            movementSpeed: 35,
            rotationSpeed: 0.006
        }
    );

    const fullScreenUtils = new FullScreenUtils();

    const toggleFullscreenElement = document.getElementById("toggleFullscreen")!;
    toggleFullscreenElement.addEventListener("click", () => {
        if (document.body.classList.contains("fs")) {
            fullScreenUtils.exitFullScreen();
        } else {
            fullScreenUtils.enterFullScreen();
        }
        fullScreenUtils.addFullScreenListener(function () {
            if (fullScreenUtils.isFullScreen()) {
                document.body.classList.add("fs");
            } else {
                document.body.classList.remove("fs");
            }
        });
    });
});

function initUI(): void {
    document.getElementById("message")?.classList.add("hidden");
    document.getElementById("canvasGL")?.classList.remove("transparent");
    setTimeout(() => document.querySelector(".promo")?.classList.remove("transparent"), 4000);
    setTimeout(() => document.querySelector("#toggleFullscreen")?.classList.remove("transparent"), 1800);

    const gui = new GUI();
    const dummyConfig = {
        github: () => window.open("https://github.com/keaukraine/webgl-voxel-airplanes")
    };

    gui.add(
        renderer.config,
        "formation",
        {
            "Single": 0,
            "Triangle": 1,
            "Large Triangle": 2,
            "Diamond": 3,
            "Cross": 4,
            "Line": 5
        }
    )
    .name("Formation")
    .onChange(value => renderer.config.formation = +value);

    gui.add(
        renderer.config,
        "currentPalette",
        {
            "Palette 1": 0,
            "Palette 2": 1,
            "Palette 3": 2
        }
    )
    .name("Palette")
    .onChange(value => renderer.changePlanePalette(+value));

    gui.add(renderer, "changePlane").name("Next plane");
    gui.add(renderer, "changeTerrain").name("Next terrain");

    gui.add(dummyConfig, "github").name("Source at Github");
}
