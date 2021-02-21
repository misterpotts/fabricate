import {expect} from 'chai';
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {FabricateCompendiumData} from "../src/scripts/game/CompendiumData";

describe('Crafting Component |', () => {

    describe('Create |', () => {

        it('Should create from Fabricate Flags', () => {
            const name = 'Glass';
            const key = 'test.key';
            const id = '1234';
            const flags: FabricateCompendiumData = <FabricateCompendiumData>{
                type: 'COMPONENT',
                component: {
                    name: name,
                    compendiumEntry: {
                        compendiumKey: key,
                        entryId: id
                    }
                }
            };
            const result = CraftingComponent.fromFlags(flags);
            expect(result.name).to.equal(name);
            expect(result.compendiumEntry.systemId).to.equal(key);
            expect(result.compendiumEntry.partId).to.equal(id);
        });

    });

    describe('Equality |', () => {

        it('Should consider two identical components to be equal', () => {
            const left = CraftingComponent.builder()
                .withName('Rocks')
                .withCompendiumEntry('test.key', '1234')
                .build();
            const right = CraftingComponent.builder()
                .withName('Rocks')
                .withCompendiumEntry('test.key', '1234')
                .build();
            const result = left.equals(right);
            expect(result).to.be.true;
        });

        it('Should consider two different components not equal', () => {
            const left = CraftingComponent.builder()
                .withName('Sand')
                .withCompendiumEntry('test.key', '4321')
                .build();
            const right = CraftingComponent.builder()
                .withName('Rocks')
                .withCompendiumEntry('test.key', '1234')
                .build();
            const result = left.equals(right);
            expect(result).to.be.false;
        });

    });

});