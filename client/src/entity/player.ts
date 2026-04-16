import {Entity} from "./entity";
import {FirstPersonControls, Scene3D} from "enable3d";
import {debug, Game, Team, Vec} from "../util";
import {PerspectiveCamera, Raycaster, Vector3} from "three";
import {Item} from "../item/main";
import {Gun} from "../item/gun";
import {CarBomb} from "../item/carbomb";
import {WaterCannon} from "../item/watercannon";

const SPAWN_LOCATIONS = [
    {pos: new Vec(34.745567321777344, 0.9106167554855347, -14.461936950683594), rot: new Vec(0, -0.6239552075879722, 0)},
    {pos: new Vec(-36.11078643798828, 0.9106065630912781, 3.3671581745147705), rot: new Vec(0, 2.1205750411731104, 0)},
    {pos: new Vec(-37.541439056396484, 0.9106178283691406, -10.285262107849121), rot: new Vec(0, 0.8988445647770794, 0)},
    {pos: new Vec(-22.994831085205078, 0.910606861114502, 3.6550843715667725), rot: new Vec(0, 1.9089538693687975, 0)},
    {pos: new Vec(-6.664977550506592, 0.9106026291847229, 9.470048904418945), rot: new Vec(0, -2.384556090537253, 0)},
    {pos: new Vec(-12.986553192138672, 0.9106032848358154, -9.966469764709473), rot: new Vec(0, 0.1941678792843692, 0)},
    {pos: new Vec(8.993915557861328, 0.9106025099754333, 9.72420597076416), rot: new Vec(0, -2.081305133003238, 0)},
    {pos: new Vec(26.095661163330078, 0.9106031060218811, 0.7932774424552917), rot: new Vec(0, -1.437714971330329, 0)},
    {pos: new Vec(32.491661071777344, 0.9106160998344421, -14.15428638458252), rot: new Vec(0, -0.5825036378531085, 0)},
    {pos: new Vec(46.958030700683594, 0.910610556602478, -2.6610238552093506), rot: new Vec(0, -1.9024088846738192, 0)},
    {pos: new Vec(51.801353454589844, 0.9106009602546692, 10.109000205993652), rot: new Vec(0, -2.5896322776465865, 0)}
]

export class Player extends Entity {
    public name: string = "NO U-NAME ASSIGNED";

    public health: number = 20;
    public maxHealth: number = 20;
    public isDead: boolean = false;
    private lastDamage: string = "NO LD-UUID ASSIGNED";
    private currentFov: number = 50;

    public gun: Gun = new Gun(this);
    public waterCannon: WaterCannon = new WaterCannon(this);
    public carBomb: CarBomb = new CarBomb(this);

    public activeItem: Item = this.gun;

    // recoil state
    public recoil = 0;
    private recoilVelocity = 0;

    constructor(scene: Scene3D, spawnPos?: Vec) {
        super("player", scene);
        this.mass = 2;
        this.hitboxSize = new Vec(0.7, 2, 0.7);

        if (!spawnPos) spawnPos = this.findSpawnPos();

        this.targetPos = spawnPos;
    }

    create() {
        if (Game.self == this) this.name = Game.playerName;

        this.gun.create();
        this.waterCannon.create();
        this.carBomb.create();

        this.createMesh()
    }

    update() {
        if (!this.remote && !this.isDead) {
            if (Game.keys["Digit1"]) this.setActiveItem(this.gun.typeId);
            else if (Game.keys["Digit2"]) this.setActiveItem(this.waterCannon.typeId);
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

        const cam = this.scene.camera as PerspectiveCamera;
        const targetFov = Game.keys["ShiftLeft"] ? 65 : 50;

        const lerpSpeed = 0.15;
        const newFov = this.currentFov + (targetFov - this.currentFov) * lerpSpeed;

        if (Math.abs(newFov - this.currentFov) > 0.01) {
            this.currentFov = newFov;
            cam.fov = this.currentFov;
            cam.updateProjectionMatrix();
        }

        const maxSpeed = Game.keys["ShiftLeft"] ? 7 : 4;
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
        else if (itemId == "water_cannon") item = this.waterCannon;
        else if (itemId == "car_bomb") item = this.carBomb;
        else {
            alert("oops");
            return;
        }

        if (!item.isUnlocked()) return;

        if (this.activeItem.model) this.activeItem.model.visible = false;
        this.activeItem = item;
    }

    createMesh() {
        if (this.mesh != null) return;

        debug(`created mesh for ${this.remote ? "remote" : "self"}`)
        this.mesh = this.scene.physics.add.capsule(
            {...this.targetPos, radius: this.hitboxSize.x / 2, length: this.hitboxSize.y, mass: this.mass},
            {phong: {color: 0xffffff}}
        );

        this.mesh.body.setAngularFactor(0, 0, 0);

        // lock camera to player
        this.mesh.visible = false;

        this.gun.createMesh();
        this.waterCannon.createMesh();
        this.carBomb.createMesh();
    }

    removeMesh() {
        super.removeMesh();
        this.gun.removeMesh();
        this.waterCannon.removeMesh();
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

            this.collidingBodies.clear();
            if (!this.remote) this.removeMesh();
        }
    }

    findSpawnPos() {
        let spawnLoc: { pos: Vec, rot: Vec } = SPAWN_LOCATIONS[Math.floor(Math.random() * SPAWN_LOCATIONS.length)]
        return spawnLoc.pos.withAdd(new Vec(Math.random() * 3, Math.random() * 3, Math.random() * 3));
    }

    respawn() {
        Game.networking.send(this.uuid, {"type": "respawn"})

        this.isDead = false;
        this.health = this.maxHealth;
        this.setPos(this.findSpawnPos());

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
