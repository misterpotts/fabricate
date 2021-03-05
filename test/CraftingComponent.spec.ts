import {expect} from 'chai';
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {FabricateCompendiumData} from "../src/scripts/game/CompendiumData";

describe('Crafting Component |', () => {

    describe('Create |', () => {

        it('Should create from Fabricate Flags', () => {
            const name = 'Glass';
            const systemId = 'compendium.key';
            const partId = '1234';
            const imageUrl = '/resources/images/img.png';
            const flags: FabricateCompendiumData = <FabricateCompendiumData>{
                type: 'COMPONENT',
                identity: {
                    partId: partId,
                    systemId: systemId
                },
                component: {
                    essences:[]
                }
            };
            const result = CraftingComponent.fromFlags(flags, name, imageUrl);
            expect(result.name).to.equal(name);
            expect(result.systemId).to.equal(systemId);
            expect(result.partId).to.equal(partId);
        });

    });

    describe('Equality |', () => {

        it('Should consider two identical components to be equal', () => {
            const name = 'Glass';
            const systemId = 'compendium.key';
            const partId = '1234';
            const imageUrl = '/resources/images/img.png';
            const essences: string[] = [];
            const left = CraftingComponent.builder()
                .withName(name)
                .withSystemId(systemId)
                .withPartId(partId)
                .withImageUrl(imageUrl)
                .withEssences(essences)
                .build();
            const right = CraftingComponent.builder()
                .withName(name)
                .withSystemId(systemId)
                .withPartId(partId)
                .withImageUrl(imageUrl)
                .withEssences(essences)
                .build();
            const result = left.equals(right);
            expect(result).to.be.true;
        });

        it('Should consider two different components not equal', () => {
            const imageUrl = '/resources/images/img.png';
            const essences: string[] = [];
            const left = CraftingComponent.builder()
                .withName('Sand')
                .withSystemId('test.key')
                .withPartId('4321')
                .withImageUrl(imageUrl)
                .withEssences(essences)
                .build();
            const right = CraftingComponent.builder()
                .withName('Rocks')
                .withSystemId('test.key')
                .withPartId('1234')
                .withImageUrl(imageUrl)
                .withEssences(essences)
                .build();
            const result = left.equals(right);
            expect(result).to.be.false;
        });

    });

});