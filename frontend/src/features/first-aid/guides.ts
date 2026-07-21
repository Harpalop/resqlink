import {
  Activity,
  Bone,
  Brain,
  Flame,
  HeartPulse,
  Skull,
  Utensils,
  Worm,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface FirstAidGuide {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  gradient: string
  callFirst: boolean
  doNot: string[]
  steps: Array<{ title: string; detail: string }>
}

export const FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'cpr',
    title: 'CPR',
    subtitle: 'Cardiac arrest — no breathing or pulse',
    icon: HeartPulse,
    gradient: 'from-rose-500 to-red-600',
    callFirst: true,
    doNot: [
      'Do not delay chest compressions to look for a pulse for more than 10 seconds',
      'Do not lean on the chest between compressions',
      'Do not stop until help arrives or the person responds',
    ],
    steps: [
      { title: 'Check response', detail: 'Tap their shoulders and shout. If no response and no normal breathing, act immediately.' },
      { title: 'Call for help', detail: 'Call 112 (or your local emergency number) on speaker. Ask someone to find an AED.' },
      { title: 'Position your hands', detail: 'Heel of one hand on the center of the chest, other hand on top, fingers interlocked, arms straight.' },
      { title: 'Push hard and fast', detail: 'Compress 5–6 cm deep at 100–120 per minute — the beat of "Stayin\' Alive". Let the chest fully recoil.' },
      { title: 'Rescue breaths (if trained)', detail: 'After 30 compressions give 2 breaths: tilt head back, lift chin, pinch nose, seal your mouth over theirs.' },
      { title: 'Use an AED when it arrives', detail: 'Turn it on and follow its voice instructions. Resume compressions immediately after any shock.' },
    ],
  },
  {
    id: 'choking',
    title: 'Choking',
    subtitle: 'Airway blocked — cannot speak, cough or breathe',
    icon: Utensils,
    gradient: 'from-amber-500 to-orange-600',
    callFirst: false,
    doNot: [
      'Do not slap the back of someone who is coughing effectively — let them cough',
      'Do not do blind finger sweeps in the mouth',
    ],
    steps: [
      { title: 'Ask: "Are you choking?"', detail: 'If they can speak or cough, encourage coughing. If silent or gasping, act now.' },
      { title: '5 back blows', detail: 'Lean them forward. Strike firmly between the shoulder blades with the heel of your hand.' },
      { title: '5 abdominal thrusts', detail: 'Stand behind, fist above the navel, grasp with the other hand, pull sharply inward and upward.' },
      { title: 'Alternate', detail: 'Keep alternating 5 back blows and 5 thrusts until the object comes out or they collapse.' },
      { title: 'If they collapse', detail: 'Call 112 and start CPR — chest compressions can dislodge the object.' },
    ],
  },
  {
    id: 'heart-attack',
    title: 'Heart Attack',
    subtitle: 'Chest pain, pressure, arm/jaw pain, sweating',
    icon: Activity,
    gradient: 'from-rose-500 to-pink-600',
    callFirst: true,
    doNot: [
      'Do not let them walk around or drive themselves',
      'Do not wait to see if the pain goes away',
      'Do not give aspirin if they are allergic or bleeding',
    ],
    steps: [
      { title: 'Call 112 immediately', detail: 'Every minute matters. Say "suspected heart attack" clearly.' },
      { title: 'Sit them down', detail: 'Half-sitting position, knees bent, head and shoulders supported. Loosen tight clothing.' },
      { title: 'Give aspirin if available', detail: 'One adult aspirin (300mg) chewed slowly — only if not allergic.' },
      { title: 'Stay and reassure', detail: 'Keep them calm and still. Anxiety increases the heart\'s workload.' },
      { title: 'Be ready for CPR', detail: 'If they become unresponsive and stop breathing normally, start CPR immediately.' },
    ],
  },
  {
    id: 'stroke',
    title: 'Stroke',
    subtitle: 'Face drooping, arm weakness, slurred speech',
    icon: Brain,
    gradient: 'from-violet-500 to-purple-600',
    callFirst: true,
    doNot: [
      'Do not give food, drink or medication — swallowing may be impaired',
      'Do not wait for symptoms to pass — "time is brain"',
    ],
    steps: [
      { title: 'Think F.A.S.T.', detail: 'Face: ask them to smile — does one side droop? Arms: can they raise both? Speech: is it slurred? Time: call 112 now.' },
      { title: 'Note the time', detail: 'Record exactly when symptoms started — treatment decisions depend on it.' },
      { title: 'Position safely', detail: 'Lay them down with head and shoulders slightly raised. If unconscious but breathing, recovery position.' },
      { title: 'Nothing by mouth', detail: 'No water, food or pills.' },
      { title: 'Monitor breathing', detail: 'Be ready to start CPR if they stop breathing normally.' },
    ],
  },
  {
    id: 'burns',
    title: 'Burns',
    subtitle: 'Thermal, chemical or electrical burns',
    icon: Flame,
    gradient: 'from-orange-500 to-red-600',
    callFirst: false,
    doNot: [
      'Do not use ice, butter, toothpaste or any home remedy',
      'Do not burst blisters',
      'Do not remove clothing stuck to the burn',
    ],
    steps: [
      { title: 'Stop the burning', detail: 'Remove the person from the source. For chemical burns, brush off dry chemicals first.' },
      { title: 'Cool with running water', detail: 'Cool tap water over the burn for 20 full minutes. Not ice-cold.' },
      { title: 'Remove jewellery', detail: 'Take off rings and watches near the area before swelling starts.' },
      { title: 'Cover loosely', detail: 'Cling film or a clean non-fluffy cloth. Do not wrap tightly.' },
      { title: 'Seek help if serious', detail: 'Call 112 for burns larger than the person\'s palm, on face/hands/joints, or any electrical/chemical burn.' },
    ],
  },
  {
    id: 'fracture',
    title: 'Fractures',
    subtitle: 'Suspected broken bone — pain, swelling, deformity',
    icon: Bone,
    gradient: 'from-blue-500 to-cyan-500',
    callFirst: false,
    doNot: [
      'Do not try to straighten or push back a deformed limb',
      'Do not move someone with a suspected spine, hip or thigh injury',
    ],
    steps: [
      { title: 'Keep it still', detail: 'Support the injury in the position found. Movement makes it worse.' },
      { title: 'Immobilize', detail: 'Splint with a rolled magazine or padding, tied above and below the injury — never over it.' },
      { title: 'Cold pack', detail: 'Wrapped ice pack for up to 20 minutes to limit swelling. Never directly on skin.' },
      { title: 'Check circulation', detail: 'Fingers/toes beyond the injury should stay warm and pink. If pale or numb, loosen the splint.' },
      { title: 'Get medical care', detail: 'Call 112 for open fractures, spine/hip injuries, or if the limb looks deformed.' },
    ],
  },
  {
    id: 'snake-bite',
    title: 'Snake Bite',
    subtitle: 'Venomous bite — swelling, severe pain',
    icon: Worm,
    gradient: 'from-emerald-500 to-teal-600',
    callFirst: true,
    doNot: [
      'Do not cut the wound or try to suck out venom',
      'Do not apply a tight tourniquet',
      'Do not let the person walk unless unavoidable',
      'Do not try to catch or kill the snake',
    ],
    steps: [
      { title: 'Move away & call 112', detail: 'Get to safety. Note the snake\'s color/pattern from a distance if possible.' },
      { title: 'Keep them still', detail: 'Movement spreads venom. Lay them down, bitten limb below heart level.' },
      { title: 'Remove tight items', detail: 'Rings, watches, tight clothing near the bite before swelling.' },
      { title: 'Immobilize the limb', detail: 'Splint it like a fracture. Mark the swelling edge with a pen and note the time.' },
      { title: 'Get antivenom fast', detail: 'Hospital treatment is the only cure. Do not wait for symptoms.' },
    ],
  },
  {
    id: 'poisoning',
    title: 'Poisoning',
    subtitle: 'Swallowed chemicals, medicines or toxins',
    icon: Skull,
    gradient: 'from-fuchsia-500 to-purple-600',
    callFirst: true,
    doNot: [
      'Do not induce vomiting unless a professional tells you to',
      'Do not give anything to drink for chemical poisoning',
    ],
    steps: [
      { title: 'Identify the poison', detail: 'Find the container, label or remains. This determines the treatment.' },
      { title: 'Call 112 / poison control', detail: 'Tell them what, how much, and when it was taken.' },
      { title: 'Follow their instructions', detail: 'Treatment differs completely by substance — follow professional advice only.' },
      { title: 'Recovery position', detail: 'If drowsy or vomiting, lay them on their side to keep the airway clear.' },
      { title: 'Bring the container', detail: 'Take the packaging to the hospital with you.' },
    ],
  },
  {
    id: 'electric-shock',
    title: 'Electric Shock',
    subtitle: 'Contact with live electricity',
    icon: Zap,
    gradient: 'from-yellow-500 to-amber-600',
    callFirst: true,
    doNot: [
      'Do not touch the person while they are in contact with the current',
      'Do not go near high-voltage sources (stay 20+ meters away)',
      'Do not use anything wet or metallic to move the source',
    ],
    steps: [
      { title: 'Cut the power', detail: 'Switch off at the mains or unplug. If impossible, push the source away with dry wood or plastic.' },
      { title: 'Call 112', detail: 'Electric shock can cause hidden internal injuries and heart problems.' },
      { title: 'Check breathing', detail: 'If unresponsive and not breathing normally, start CPR immediately.' },
      { title: 'Treat burns', detail: 'Cool entry and exit burn wounds with running water for 20 minutes.' },
      { title: 'Always get checked', detail: 'Even if they seem fine — heart rhythm problems can appear hours later.' },
    ],
  },
]
