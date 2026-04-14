import {Entity} from "./entity";
import {FirstPersonControls, Scene3D} from "enable3d";
import {debug, Game, Team, Vec} from "../util";
import {Raycaster, Vector3} from "three";
import {Item} from "../item/main";
import {Gun} from "../item/gun";
import {CarBomb} from "../item/carbomb";

export class Player extends Entity {
    public name: string = "NO U-NAME ASSIGNED";

    public health: number = 20;
    public maxHealth: number = 20;
    public isDead: boolean = false;
    private lastDamage: string = "NO LD-UUID ASSIGNED";

    public gun: Gun = new Gun(this);
    public carBomb: CarBomb = new CarBomb(this);

    public activeItem: Item = this.gun;

    // recoil state
    public recoil = 0;
    private recoilVelocity = 0;

    constructor(scene: Scene3D) {
        super("player", scene);
        this.mass = 2;
        this.hitboxSize = new Vec(0.7, 2, 0.7);
    }

    create() {
        if (Game.self == this) this.name = Game.playerName;

        this.gun.create();
        this.carBomb.create();

        this.createMesh()
    }

    update() {
        if (!this.remote && !this.isDead) {
            if (Game.keys["Digit1"]) this.setActiveItem(this.gun.typeId);
            else if (Game.keys["Digit3"]) this.setActiveItem(this.carBomb.typeId);
        }

        if (this.mesh == null) return;
        if (Game.self === this) this.handlePlayerControls();
        if (!this.remote) {
            if (!this.isDead) {
                if (this.health <= 0) {
                    debug("I have perished")
                    this.health = this.maxHealth;
                    this.isDead = true;
                    this.setPos(new Vec(0, 2, 0));
                    this.handleDeath();
                }
            }
        }

        if (this.activeItem.model && !this.activeItem.model.visible) this.activeItem.model.visible = true;
        this.activeItem.update();

        // recoil physics (critically damped spring-ish)
        const stiffness = 0.15;
        const damping = 0.8;

        this.recoilVelocity -= this.recoil * stiffness;
        this.recoilVelocity *= damping;
        this.recoil += this.recoilVelocity;
        if (Math.abs(this.recoil) < 0.0001) {
            this.recoil = 0;
            this.recoilVelocity = 0;
        }

        super.update();
    }

    private handlePlayerControls() {
        if (this.isDead) return;

        const maxSpeed = Game.keys["ShiftLeft"] ? 12 : 5;
        const accel = 0.2;
        const friction = 0.15;

        // same pattern as the official example
        const direction = new Vector3();
        Game.world!.camera.getWorldDirection(direction);
        const theta = Math.atan2(direction.x, direction.z);

        let moveX = 0;
        let moveZ = 0;

        if (Game.keys["KeyW"]) {
            moveX += Math.sin(theta) * maxSpeed;
            moveZ += Math.cos(theta) * maxSpeed;
        }
        if (Game.keys["KeyS"]) {
            moveX -= Math.sin(theta) * maxSpeed;
            moveZ -= Math.cos(theta) * maxSpeed;
        }
        if (Game.keys["KeyA"]) {
            moveX += Math.sin(theta + Math.PI * 0.5) * maxSpeed;
            moveZ += Math.cos(theta + Math.PI * 0.5) * maxSpeed;
        }
        if (Game.keys["KeyD"]) {
            moveX += Math.sin(theta - Math.PI * 0.5) * maxSpeed;
            moveZ += Math.cos(theta - Math.PI * 0.5) * maxSpeed;
        }

        const hasInput = moveX !== 0 || moveZ !== 0;
        const current = this.mesh!.body.velocity;

        const finalVX = hasInput
            ? current.x + (moveX - current.x) * accel
            : current.x * (1 - friction);
        const finalVZ = hasInput
            ? current.z + (moveZ - current.z) * accel
            : current.z * (1 - friction);

        this.vel = new Vec(finalVX, this.vel.y, finalVZ);

        if (Game.keys["Space"] && this.isColliding()) {
            this.mesh!.body.setVelocityY(12 * (1 / this.mass));
        }

        this.tryStepUp();
    }

    private tryStepUp() {
        const MAX_STEP = 0.5;
        const STEP_PUSH = 4;

        const vel = this.mesh!.body.velocity;
        const horizSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);

        if (horizSpeed < 0.5 || vel.y > 0.5) return;

        const pos = this.getPos();
        const nx = vel.x / horizSpeed;
        const nz = vel.z / horizSpeed;
        const footY = pos.y - this.hitboxSize.y / 2;

        // first: is there actually a wall/step directly ahead at foot level?
        const forwardRay = new Raycaster(
            new Vector3(pos.x, footY + 0.1, pos.z),
            new Vector3(nx, 0, nz)
        );
        const forwardHits = forwardRay.intersectObjects(Game.world!.scene.children, true)
            .filter(h => !h.object.userData.bloodyFridayEntity); // ignore other players

        if (forwardHits.length === 0 || forwardHits[0].distance > 0.8) return; // nothing close ahead

        // second: what height is the top of that step?
        const downRay = new Raycaster(
            new Vector3(pos.x + nx * 0.5, footY + MAX_STEP + 0.1, pos.z + nz * 0.5),
            new Vector3(0, -1, 0)
        );
        const downHits = downRay.intersectObjects(Game.world!.scene.children, true)
            .filter(h => !h.object.userData.bloodyFridayEntity);

        if (downHits.length === 0) return;

        const stepHeight = downHits[0].point.y - footY;

        if (stepHeight > 0.05 && stepHeight <= MAX_STEP) {
            this.mesh!.body.setVelocityY(STEP_PUSH);
        }
    }

    setActiveItem(itemId: string) {
        let item;

        if (itemId == "gun") item = this.gun;
        else if (itemId == "car_bomb") item = this.carBomb;
        else {
            alert("oops");
            return;
        }

        if (this.activeItem.model) this.activeItem.model.visible = false;
        this.activeItem = item;
    }

    createMesh() {
        if (this.mesh != null) return;

        debug(`created mesh for ${this.remote ? "remote" : "self"}`)
        this.mesh = this.scene.physics.add.capsule(
            {...new Vec(Math.random() * 5 - 3, 20, Math.random() * 5 - 3), radius: this.hitboxSize.x / 2, length: this.hitboxSize.y, mass: this.mass},
            {phong: {color: 0xffffff}}
        );

        this.mesh.body.setAngularFactor(0, 0, 0);

        // lock camera to player
        this.mesh.visible = false;

        this.gun.createMesh();
        this.carBomb.createMesh();
    }

    removeMesh() {
        super.removeMesh();
        this.gun.removeMesh();
        this.carBomb.removeMesh();
    }

    applyRecoil(amount: number) {
        // instant kick upward
        this.recoilVelocity += amount;
    }

    damage(amount: number, cause?: string) {
        if (Game.self == this) {
            Game.self!.health -= amount;
            if (cause) {
                this.lastDamage = cause;
            }
        } else {
            Game.networking.sendDirect(Game.self!.uuid, this.uuid, {"type": "damage", "amount": amount});
        }
    }

    handleDeath() {
        if (this.lastDamage) {
            Game.networking.sendDirect(this.uuid, this.lastDamage, {"type": "kill"})
            Game.networking.send(this.uuid, {"type": "death"})

            if (!this.remote) this.removeMesh();
        }
    }

    respawn() {
        Game.networking.send(this.uuid, {"type": "respawn"})

        this.isDead = false;
        this.health = this.maxHealth;
        this.setPos({ x: 0, y: 5, z: 0 } as any);

        if (!this.remote) this.createMesh();
    }

    makePacket(): any {
        let packet = super.makePacket();

        if (Game.team != undefined) packet["team"] = Game.team;
        packet["name"] = this.name;
        packet["item"] = this.activeItem.typeId;

        return packet;
    }

    handlePacket(sender: string, data: any) {
        super.handlePacket(sender, data);

        let datRot = data["rot"];
        if (datRot != undefined) {
            this.targetRot = new Vec(datRot.x, datRot.y, datRot.z);
        }

        let datTeam: Team = data["team"];
        if (datTeam != undefined && this.model == undefined && !this.isLoadingModel) {
            debug("setting model for " + sender);
            this.modelOffset = new Vec(0, -1, 0);

            this.loadModel(datTeam == Team.LOYALIST ? "/loyalist.glb" : "/nationalist.glb", () => {
                if (datTeam == Team.NATIONALIST) this.model!.scale.set(1, 1, 1);
                else this.model!.scale.set(0.5, 0.5, 0.5);
                if (Game.self == this) {
                    this.model!.visible = false;
                }
            });
        }

        let datItem = data["item"];
        this.setActiveItem(datItem);
    }
}
