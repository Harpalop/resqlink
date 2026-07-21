package com.resqlink.api.assistant;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Rule-based emergency guidance engine. Matches the user's message against
 * keyword groups and returns curated first-aid / disaster guidance.
 * Designed so a HTTP-based LLM provider can replace answer() later without
 * touching the controller or the frontend.
 */
@Service
public class AssistantEngine {

    public record AssistantAnswer(String reply, List<String> suggestions) {
    }

    private record Rule(List<String> keywords, String reply) {
    }

    private static final List<String> DEFAULT_SUGGESTIONS = List.of(
            "Someone is unconscious",
            "How do I do CPR?",
            "Someone is choking",
            "Severe bleeding",
            "What to do in a flood?"
    );

    private static final List<Rule> RULES = List.of(
            new Rule(List.of("cpr", "unconscious", "not breathing", "no pulse", "cardiac", "collapsed"),
                    """
                    🫀 **Suspected cardiac arrest — act NOW:**
                    1. Call 112 immediately (put it on speaker).
                    2. Check response: tap shoulders, shout. No response + no normal breathing = start CPR.
                    3. Chest compressions: heel of hand on center of chest, push hard and fast — 5-6 cm deep, 100-120/min.
                    4. Don't stop until help arrives or they respond.
                    5. If an AED is nearby, send someone to get it and follow its voice prompts.

                    Open the CPR guide in the First Aid Center for detailed steps."""),
            new Rule(List.of("choking", "can't breathe", "cannot breathe", "food stuck", "airway"),
                    """
                    🚨 **Choking — do this:**
                    1. Ask "Are you choking?" — if they can cough or speak, encourage coughing.
                    2. If silent/gasping: 5 firm back blows between the shoulder blades.
                    3. Then 5 abdominal thrusts: fist above the navel, pull sharply in and up.
                    4. Alternate 5 + 5 until the object comes out.
                    5. If they collapse: call 112 and start CPR."""),
            new Rule(List.of("bleeding", "blood loss", "cut", "wound", "stab"),
                    """
                    🩸 **Severe bleeding:**
                    1. Call 112 for heavy or spurting bleeding.
                    2. Press directly on the wound with a clean cloth — hard, continuous pressure.
                    3. Don't remove soaked cloths; add more layers on top.
                    4. If a limb: raise it above heart level while keeping pressure.
                    5. Never remove an embedded object — press around it instead.
                    6. Keep them warm and lying down until help arrives."""),
            new Rule(List.of("heart attack", "chest pain", "chest pressure", "arm pain jaw"),
                    """
                    ❤️ **Suspected heart attack:**
                    1. Call 112 NOW — do not wait to see if it passes.
                    2. Sit them down, half-sitting, knees bent. Loosen tight clothing.
                    3. Give one adult aspirin (300mg) to chew slowly — only if not allergic.
                    4. Keep them calm and still.
                    5. If they become unresponsive: start CPR immediately."""),
            new Rule(List.of("stroke", "face droop", "slurred", "arm weak"),
                    """
                    🧠 **Suspected stroke — think F.A.S.T.:**
                    - **F**ace: ask them to smile — does one side droop?
                    - **A**rms: can they raise both?
                    - **S**peech: is it slurred?
                    - **T**ime: any yes → call 112 immediately and note the exact time symptoms started.
                    Give NOTHING by mouth. Lay them down with head slightly raised."""),
            new Rule(List.of("burn", "scald", "fire injury"),
                    """
                    🔥 **Burns:**
                    1. Cool the burn under running tap water for a full 20 minutes.
                    2. Remove rings/watches near the area before it swells.
                    3. Cover loosely with cling film or a clean non-fluffy cloth.
                    4. NEVER use ice, butter, or toothpaste. Never burst blisters.
                    5. Call 112 for burns bigger than their palm, or on face/hands/joints."""),
            new Rule(List.of("snake", "bite venom"),
                    """
                    🐍 **Snake bite:**
                    1. Move away from the snake and call 112.
                    2. Keep the person STILL — movement spreads venom.
                    3. Remove rings and tight items near the bite.
                    4. Splint the limb and keep it below heart level.
                    5. DO NOT cut, suck, ice, or tourniquet the wound.
                    Antivenom at a hospital is the only treatment."""),
            new Rule(List.of("poison", "swallowed", "overdose", "toxic"),
                    """
                    ☠️ **Poisoning:**
                    1. Find out WHAT was taken, HOW MUCH, and WHEN.
                    2. Call 112 / poison control with that information.
                    3. Do NOT induce vomiting unless a professional tells you to.
                    4. If drowsy or vomiting: recovery position (on their side).
                    5. Take the container/packaging to the hospital."""),
            new Rule(List.of("flood", "flooding", "water rising"),
                    """
                    🌊 **Flood safety:**
                    1. Move to higher ground immediately — never walk or drive through floodwater.
                    2. 15 cm of moving water can knock you down; 60 cm can float a car.
                    3. Switch off electricity if water is entering your home.
                    4. Keep your phone charged; use the ResQLink SOS if trapped.
                    5. Follow official evacuation orders without delay."""),
            new Rule(List.of("earthquake", "tremor", "quake"),
                    """
                    🌍 **Earthquake:**
                    - Indoors: DROP, COVER under a sturdy table, HOLD ON. Stay away from windows.
                    - Do NOT run outside during shaking or use elevators.
                    - Outdoors: move to open ground away from buildings and power lines.
                    - After: expect aftershocks, check for gas leaks, use stairs only.
                    - Trapped? Tap on pipes rather than shouting — save your air."""),
            new Rule(List.of("cyclone", "hurricane", "storm", "typhoon"),
                    """
                    🌀 **Cyclone / severe storm:**
                    1. Stay indoors, away from windows — shelter in the smallest interior room.
                    2. Charge devices and fill containers with drinking water NOW.
                    3. Secure or bring in loose outdoor objects.
                    4. Do not go outside during the eye of the storm — winds return violently.
                    5. Follow official alerts in the Disaster Alerts section."""),
            new Rule(List.of("heatwave", "heat stroke", "heatstroke", "overheating"),
                    """
                    ☀️ **Heatstroke:**
                    1. Symptoms: hot dry skin, confusion, temperature above 40°C — call 112.
                    2. Move them somewhere cool and shaded immediately.
                    3. Cool aggressively: wet cloths on neck/armpits/groin, fan them.
                    4. Sips of cool water only if fully conscious.
                    5. Prevention: hydrate hourly, avoid the sun 12-4 PM."""),
            new Rule(List.of("fracture", "broken bone", "broken arm", "broken leg"),
                    """
                    🦴 **Suspected fracture:**
                    1. Keep the limb still in the position found — don't straighten it.
                    2. Splint with something rigid, tied above and below the injury.
                    3. Wrapped ice pack for up to 20 minutes.
                    4. Check fingers/toes stay warm and pink.
                    5. Spine/hip injury or bone through skin → call 112, don't move them."""),
            new Rule(List.of("electric", "shock", "electrocut"),
                    """
                    ⚡ **Electric shock:**
                    1. DO NOT touch them while they're in contact with the source.
                    2. Cut power at the mains, or push the source away with dry wood/plastic.
                    3. Call 112 — internal injuries can be invisible.
                    4. Not breathing? Start CPR.
                    5. Always get medically checked, even if they feel fine.""")
    );

    public AssistantAnswer answer(String message) {
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);

        for (Rule rule : RULES) {
            for (String keyword : rule.keywords()) {
                if (normalized.contains(keyword)) {
                    return new AssistantAnswer(rule.reply(), followUps(normalized));
                }
            }
        }

        if (normalized.contains("hello") || normalized.contains("hi ") || normalized.equals("hi")) {
            return new AssistantAnswer(
                    "Hello! I'm the ResQLink Emergency Assistant. Describe the situation "
                            + "(e.g. \"someone collapsed\", \"kitchen burn\", \"flood in my area\") "
                            + "and I'll give you immediate step-by-step guidance.",
                    DEFAULT_SUGGESTIONS);
        }

        return new AssistantAnswer(
                "I can guide you through: CPR, choking, severe bleeding, heart attack, stroke, "
                        + "burns, fractures, snake bites, poisoning, electric shock, and disasters "
                        + "(flood, earthquake, cyclone, heatwave).\n\n"
                        + "Describe what's happening — or if it's life-threatening, call 112 first.",
                DEFAULT_SUGGESTIONS);
    }

    private List<String> followUps(String matched) {
        if (matched.contains("cpr") || matched.contains("unconscious")) {
            return List.of("Where do I place my hands?", "Someone is choking", "Severe bleeding");
        }
        return List.of("How do I do CPR?", "Severe bleeding", "What to do in an earthquake?");
    }

    public Map<String, Object> disclaimer() {
        return Map.of("disclaimer",
                "AI assistance does not replace professional medical advice. "
                        + "In a life-threatening emergency always call 112 first.");
    }
}
