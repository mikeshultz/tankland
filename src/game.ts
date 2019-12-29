const MOVEMENT_STEP = 0.1
const ROTATION_STEP = 1 // Euler angle degrees

/**
 * step a linear point in the direction of the dest by step amount
 */
function step(current, dest, step) {
  const diff = Math.abs(current - dest) < step
  // We're at dest
  if (diff) return dest

  // Step towards dest
  if (current > dest) {
    return current - step
  } else if (current < dest) {
    if (diff < step) {
      return current + step
    } else {
      return dest
    }
  }
  return dest
}

/**
 * Tank patrolling the parcel
 */
class TankSystem {
  // this group will contain every entity that has a Transform component
  //group = engine.getComponentGroup(Transform)
  path = [
    {
      x: 3,
      y: 0,
      z: 12,
      rot: Quaternion.Euler(0, 90, 0)
    },
    {
      x: 13.2,
      y: 0,
      z: 12,
      rot: Quaternion.Euler(0, -180, 0)
    },
    {
      x: 13.2,
      y: 0,
      z: 3,
      rot: Quaternion.Euler(0, -90, 0)
    },
    { // starting point
      x: 3,
      y: 0,
      z: 3,
      rot: Quaternion.Euler(0, 0, 0)
    }
  ]
  running = true
  turning = false
  turned = 0 // TODO: WTF
  destination = 0 // destination path index
  tank = null

  constructor(tankComponent) {
    this.tank = tankComponent
  }

  update(dt: number) {
    if (!this.running || !this.tank) return
    if (!this.path[this.destination]) {
      log(`Destionation ${this.destination} does not exist!`)
      return
    }

    const transform = this.tank.getComponent(Transform)
    if (!transform) {
      log(`Missing transform?!?`)
      return
    }

    // Move towards the next point(destination) in the path
    if (!this.turning) {
      const newX = step(transform.position.x, this.path[this.destination].x, MOVEMENT_STEP)
      const newZ = step(transform.position.z, this.path[this.destination].z, MOVEMENT_STEP)
      if (newX != transform.position.x || newZ != transform.position.z) {
        //log(`new coords: (${newX}, 0, ${newZ}) heading to (${this.path[this.destination].x}, 0, ${this.path[this.destination].z})`)
        transform.position.set(newX, 0, newZ)
      } else {
        this.turning = true
        if (this.destination < 3) {
          this.destination += 1
        } else {
          this.destination = 0
        }
      }
    }

    // Turn right when reaching the next point in the path
    if (this.turning) {
      if (this.turned < 90) {
        // Up is Right for this model because reasons
        transform.rotate(Vector3.Up(), ROTATION_STEP)
        this.turned += ROTATION_STEP
      } else {
        this.turning = false
        this.turned = 0
      }
    }
  }
}



function createBox(position, scale, rotation) {
  scale = scale || new Vector3(2,2,1)
  rotation = rotation || Quaternion.Euler(0, 0, 0)
  const e = new Entity()

  const b = new BoxShape()

  const t = new Texture('materials/box-texture.png', {
    hasAlpha: false
  })

  const m = new Material()
  m.albedoTexture = t
  m.albedoColor = new Color3(1, 1, 1) // black
  m.ambientColor = new Color3(0, 0, 0) // black
  m.emissiveColor = new Color3(0, 0, 0) // black
  m.reflectionColor = new Color3(0, 0, 0) // black
  m.reflectivityColor = new Color3(0, 0, 0) // black
  m.metallic = 0
  m.roughness = 1

  e.addComponent(b)
  e.addComponent(m)
  e.addComponent(new Transform({
    position,
    rotation,
    scale
  }))
  //e.addComponent(new Billboard(false, true, false))

  return e
}

function createGround() {
  const e = new Entity()

  const p = new PlaneShape()
  //p.height = 18
  //p.width = 18
  log(`p`, p)

  const m = new Material()
  m.albedoColor = new Color3(0, 0, 0) // black
  m.ambientColor = new Color3(0, 0, 0) // black
  m.emissiveColor = new Color3(0, 0, 0) // black
  m.reflectionColor = new Color3(0, 0, 0) // black
  m.reflectivityColor = new Color3(0, 0, 0) // black
  m.metallic = 0
  m.roughness = 1

  e.addComponent(p)
  e.addComponent(m)
  e.addComponent(new Transform({
    position: new Vector3(8,0,8),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(16,16,1)
  }))

  return e
}

function spawnTank() {
  const position = new Vector3(3, 0, 3)
  const rotation = Quaternion.Euler(0, 90, 0)
  const tank = new Entity()
  tank.addComponent(new GLTFShape('models/tank.gltf'))
  tank.addComponent(new Transform({ position, rotation }))
  return tank
}

const box1 = createBox(new Vector3(4, 0.5, 4), new Vector3(1, 1, 1))
const box2 = createBox(new Vector3(8, 0.5, 8), new Vector3(1, 1, 1), Quaternion.Euler(0, 40, 0))
const ground = createGround()
const tank = spawnTank()

engine.addEntity(ground)
engine.addEntity(box1)
engine.addEntity(box2)
engine.addEntity(tank)
// Add a new instance of the system to the engine
engine.addSystem(new TankSystem(tank))
